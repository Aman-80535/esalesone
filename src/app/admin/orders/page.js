'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAdminOrders, updateOrderStatusAdmin } from '@/redux/user/userActions';
import { formatCurrency, simpleNotify } from '@/utils/common';
import Loader from '@/app/components/common/Loader';
import moment from 'moment';

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { adminOrders = [], loading } = useSelector((s) => s.user);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAllAdminOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    await dispatch(updateOrderStatusAdmin({ orderId, status: newStatus }));
    dispatch(fetchAllAdminOrders());
  };

  const filteredOrders = adminOrders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (order.status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      (order.fullName || '').toLowerCase().includes(query) ||
      (order.email || '').toLowerCase().includes(query) ||
      (order.phone || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Orders Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review customer orders, update tracking statuses, and process deliveries.
          </p>
        </div>
        <button
          className="btn-admin-sm !py-2 !px-4"
          onClick={() => dispatch(fetchAllAdminOrders())}
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card !p-4 !mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <input
          type="text"
          className="admin-form-input !max-w-md"
          placeholder="Search by Order ID, Name, Email or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Status:
          </label>
          <select
            className="admin-form-select !w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({adminOrders.length})</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        {loading && !adminOrders.length ? (
          <Loader text="Loading orders list..." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Order Date</th>
                  <th>Items & Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono text-xs font-bold text-gray-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td>
                        <div className="font-semibold text-gray-900 leading-snug">
                          {order.fullName || 'Customer'}
                        </div>
                        <div className="text-xs text-gray-500">{order.email || '-'}</div>
                        <div className="text-xs text-gray-400">{order.phone || ''}</div>
                      </td>
                      <td className="text-xs text-gray-600 whitespace-nowrap">
                        {order.date
                          ? moment(order.date).format('DD/MM/YYYY hh:mm A')
                          : '-'}
                      </td>
                      <td>
                        <div className="font-bold text-emerald-800">
                          {formatCurrency(order.grandTotal)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items?.length || 1} product(s)
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            order.payment || order.paymentMethod === 'card'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentMethod ? order.paymentMethod.toUpperCase() : order.payment ? 'PAID' : 'COD'}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`badge-status badge-${(order.status || 'pending').toLowerCase()} !cursor-pointer border-0`}
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-admin-sm !bg-emerald-50 !text-emerald-800 !border-emerald-200"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="admin-modal-title !mb-1">Order #{selectedOrder.id}</h2>
                <p className="text-xs text-gray-500">
                  Placed on {selectedOrder.date ? moment(selectedOrder.date).format('dddd, MMMM Do YYYY, h:mm A') : '-'}
                </p>
              </div>
              <span className={`badge-status badge-${(selectedOrder.status || 'pending').toLowerCase()}`}>
                {selectedOrder.status || 'pending'}
              </span>
            </div>

            {/* Customer & Shipping Details */}
            <div className="p-4 bg-gray-50 rounded-xl border mb-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-800 text-xs uppercase mb-1">Customer Information</h4>
                <p className="font-medium text-gray-900">{selectedOrder.fullName || 'Customer'}</p>
                <p className="text-gray-600">{selectedOrder.email || 'No email'}</p>
                <p className="text-gray-600">{selectedOrder.phone || 'No phone'}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-xs uppercase mb-1">Shipping Address</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedOrder.address || ''}<br />
                  {selectedOrder.city ? `${selectedOrder.city}, ` : ''}{selectedOrder.state || ''} {selectedOrder.zip || ''}
                </p>
              </div>
            </div>

            {/* Order Items Table */}
            <h4 className="font-bold text-gray-800 text-sm mb-3">Order Items ({selectedOrder.items?.length || 0})</h4>
            <div className="border rounded-xl overflow-hidden mb-5">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={item?.images?.[0] || item?.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded border"
                          />
                          <span className="font-semibold text-xs text-gray-900">
                            {item.name || item.title}
                          </span>
                        </div>
                      </td>
                      <td className="text-xs font-semibold">{item.size || 'M'}</td>
                      <td className="text-xs">{formatCurrency(item.price)}</td>
                      <td className="text-xs">{item.quantity || 1}</td>
                      <td className="text-right font-bold text-xs">
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-emerald-800 font-semibold">Payment Method</p>
                <p className="text-sm font-bold text-emerald-950 uppercase">
                  {selectedOrder.paymentMethod || (selectedOrder.payment ? 'Card / Stripe' : 'Cash on Delivery')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-800 font-semibold">Grand Total</p>
                <p className="text-xl font-black text-emerald-900">
                  {formatCurrency(selectedOrder.grandTotal)}
                </p>
              </div>
            </div>

            {/* Status Selector & Close */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-700">Update Status:</label>
                <select
                  className="admin-form-select !py-1 !text-sm !w-auto"
                  value={selectedOrder.status || 'pending'}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="button"
                className="btn-admin-sm !py-2 !px-5 font-semibold"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
