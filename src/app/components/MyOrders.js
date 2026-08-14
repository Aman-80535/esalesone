'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders, cancelUserOrder, addToCart } from '@/redux/cart/cartAction';
import { formatCurrency, simpleNotify } from '@/utils/common';
import Loader from './common/Loader';
import Link from 'next/link';
import moment from 'moment';
import { useRouter } from 'next/navigation';

export default function OrderHistory() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { orderList = [], loading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.user);
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch, token]);

  const handleCancelOrder = async (orderId) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      setCancellingId(orderId);
      try {
        await dispatch(cancelUserOrder({ orderId, reason: 'Customer requested cancellation' }));
        dispatch(fetchUserOrders());
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handleReorder = async (items = []) => {
    for (const item of items) {
      await dispatch(addToCart({ ...item, quantity: item.quantity || 1 }));
    }
    simpleNotify('Items added to cart!');
    router.push('/order');
  };

  const filteredOrders = orderList.filter((order) => {
    if (selectedStatusTab === 'all') return true;
    return (order.status || 'pending').toLowerCase() === selectedStatusTab.toLowerCase();
  });

  const getStatusStep = (status) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  return (
    <div className="bg-[#f4f7f6] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950">My Orders</h1>
            <p className="text-xs text-gray-500 mt-1">
              Track packages, download receipts, and manage recent purchases
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-white text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-50"
            onClick={() => dispatch(fetchUserOrders())}
          >
            🔄 Refresh Orders
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedStatusTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                selectedStatusTab === tab
                  ? 'bg-emerald-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {tab} ({tab === 'all' ? orderList.length : orderList.filter((o) => (o.status || 'pending').toLowerCase() === tab).length})
            </button>
          ))}
        </div>

        {loading && !orderList.length ? (
          <Loader text="Retrieving your orders..." />
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Orders Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedStatusTab === 'all'
                ? "You haven't placed any orders with us yet."
                : `No orders currently matching "${selectedStatusTab}".`}
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const isCancelled = order.status === 'cancelled';
              const canCancel = ['pending', 'processing'].includes((order.status || 'pending').toLowerCase());

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6"
                >
                  {/* Card Header: Order ID & Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-xs font-bold text-gray-500">ORDER ID:</span>
                      <p className="font-mono font-bold text-sm text-gray-950">#{order.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Placed on {order.date ? moment(order.date).format('MMMM Do YYYY, h:mm A') : '-'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Timeline Bar */}
                  {!isCancelled && (
                    <div className="py-2">
                      <p className="text-xs font-bold text-gray-700 mb-3">Delivery Progress</p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                        <div className={`p-2 rounded-xl border ${currentStep >= 1 ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                          1. Order Placed
                        </div>
                        <div className={`p-2 rounded-xl border ${currentStep >= 2 ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                          2. Processing
                        </div>
                        <div className={`p-2 rounded-xl border ${currentStep >= 3 ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                          3. Out for Delivery
                        </div>
                        <div className={`p-2 rounded-xl border ${currentStep >= 4 ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' : 'bg-gray-50 text-gray-400'}`}>
                          4. Delivered 🎉
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-3">
                    {(order.items || []).map((item, idx) => {
                      const itemImg = item.images?.[0] || item.image || '/placeholder.png';
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-xl border bg-white"
                            />
                            <div>
                              <h4 className="font-bold text-xs text-gray-900">{item.name || item.title}</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Size: <span className="font-semibold text-gray-800">{item.size || 'M'}</span> | Qty: {item.quantity}
                              </p>
                              <p className="text-xs font-bold text-emerald-800 mt-1">
                                {formatCurrency(item.price)} each
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-gray-500 block">Subtotal</span>
                            <span className="font-black text-sm text-gray-900">
                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Address & Grand Total */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-500 font-medium">Delivered to:</span>
                      <p className="font-bold text-gray-900">
                        {order.address ? `${order.address}, ${order.city || ''} ${order.zip || ''}` : 'Standard Delivery Address'}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        Payment: <span className="font-semibold uppercase">{order.paymentMethod || (order.payment ? 'Card/Online' : 'Cash on Delivery')}</span>
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-gray-500">Grand Total Paid</span>
                      <span className="text-xl font-black text-emerald-950">
                        {formatCurrency(order.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingId === order.id}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="px-5 py-2 rounded-xl bg-emerald-900 text-white font-bold text-xs shadow hover:bg-emerald-800"
                      onClick={() => handleReorder(order.items)}
                    >
                      Buy Again / Reorder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
