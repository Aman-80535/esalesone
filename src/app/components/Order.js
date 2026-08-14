'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addOrder } from '@/redux/cart/cartAction';
import CheckoutAddressForm from './forms/CheckoutAddressForm';
import Loader from './common/Loader';
import { sendEmail } from '@/utils/sendEmail';
import {
  formatCurrency,
  successNotify,
  errorNotify,
  successOrderSubject,
  successOrdertext,
} from '@/utils/common';
import Link from 'next/link';

export default function OrderBookingPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState(null);
  const { items = [], loading } = useSelector((s) => s.cart);
  const { token, userData } = useSelector((s) => s.user);
  const [orderInProcess, setOrderInProcess] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const handleOrderSubmit = async (paymentDetails = {}) => {
    setOrderInProcess(true);
    try {
      const orderPayload = {
        items,
        ...checkoutFormData,
        ...paymentDetails,
        grandTotal: checkoutFormData?.grandTotal || grandTotal,
        status: 'pending',
        userEmail: checkoutFormData?.email || userData?.email || '',
      };

      const result = await dispatch(addOrder(orderPayload));

      if (addOrder.fulfilled.match(result)) {
        setShowPopup(false);

        // Asynchronously trigger order confirmation email
        try {
          const createdOrder = result.payload;
          if (createdOrder && createdOrder.userEmail) {
            await sendEmail({
              to: createdOrder.userEmail,
              subject: successOrderSubject(createdOrder),
              html: successOrdertext(createdOrder),
            });
          }
        } catch (emailErr) {
          console.warn('Order confirmation email notice:', emailErr);
        }

        router.push('/myorders');
      } else {
        errorNotify(result.payload || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      errorNotify(error.message || 'Something went wrong while placing order');
    } finally {
      setOrderInProcess(false);
    }
  };

  if (orderInProcess) {
    return <Loader text="Securing transaction & placing your order..." />;
  }

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#f4f7f6] flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🛒
          </div>
          <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            There are no items currently in your bag to checkout. Browse our new arrivals and add fashion items to continue.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-8 py-3.5 bg-emerald-900 text-white rounded-2xl font-bold text-xs shadow-lg hover:bg-emerald-800 transition"
          >
            Start Shopping Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100/70 px-3.5 py-1 rounded-full">
            Fast & Secure Checkout
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 mt-2">
            Complete Your Order
          </h1>
        </div>

        {/* Checkout Address & Summary Form */}
        <CheckoutAddressForm
          setShowPopup={setShowPopup}
          setCheckoutFormData={setCheckoutFormData}
          grandTotal={grandTotal}
          cartItems={items}
        />

        {/* Confirmation Modal */}
        {showPopup && checkoutFormData && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPopup(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                  📦
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Confirm Your Delivery Details
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Please verify your order details before final submission
                </p>
              </div>

              {/* Order Info Breakdown */}
              <div className="p-4 bg-gray-50 rounded-2xl border text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Deliver to:</span>
                  <span className="font-bold text-gray-900">{checkoutFormData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Contact Phone:</span>
                  <span className="font-bold text-gray-900">{checkoutFormData.phone}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-medium">Shipping Address:</span>
                  <span className="font-bold text-gray-900 text-right max-w-[220px]">
                    {checkoutFormData.address}, {checkoutFormData.city}, {checkoutFormData.state} {checkoutFormData.zip}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Payment Mode:</span>
                  <span className="font-bold text-emerald-800 uppercase">
                    {checkoutFormData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / Card'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-950 pt-2 border-t">
                  <span>Total Amount:</span>
                  <span className="text-emerald-900 text-base">
                    {formatCurrency(checkoutFormData.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
                  onClick={() => setShowPopup(false)}
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  className="py-3 px-4 rounded-xl bg-emerald-900 text-white font-bold text-xs shadow-lg hover:bg-emerald-800"
                  onClick={() =>
                    handleOrderSubmit({
                      payment: checkoutFormData.paymentMethod === 'card' ? 'success' : null,
                      paymentMethod: checkoutFormData.paymentMethod,
                    })
                  }
                >
                  Place Order Now →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
