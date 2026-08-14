'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import { formatCurrency, simpleNotify } from '@/utils/common';
import { applyCouponCode, removeCouponCode } from '@/redux/cart/cartSlice';
import { saveUserAddress } from '@/redux/user/userActions';

const schema = z.object({
  fullName: z.string().min(2, 'Full Name is required (minimum 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-()\s]+$/, 'Invalid phone number format'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP / PIN code must be at least 5 digits').max(10, 'Invalid PIN code'),
});

export default function CheckoutAddressForm({
  setShowPopup,
  setCheckoutFormData,
  grandTotal,
  cartItems = [],
}) {
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.user);
  const { appliedCoupon, couponDiscount = 0 } = useSelector((s) => s.cart);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');

  const savedAddresses = userData?.addresses || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      address: '',
      city: '',
      state: '',
      zip: '',
    },
  });

  useEffect(() => {
    if (userData) {
      if (userData.firstName || userData.lastName) {
        setValue('fullName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim());
      }
      if (userData.email) setValue('email', userData.email);
      if (userData.phone) setValue('phone', userData.phone);
    }
  }, [userData, setValue]);

  const handleSelectSavedAddress = (e) => {
    const id = e.target.value;
    setSelectedSavedAddressId(id);
    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setValue('fullName', found.fullName || '');
      setValue('phone', found.phone || '');
      setValue('address', found.address || '');
      setValue('city', found.city || '');
      setValue('state', found.state || '');
      setValue('zip', found.zip || '');
    }
  };

  const shippingCost =
    appliedCoupon?.discountType === 'shipping'
      ? 0
      : shippingMethod === 'express'
      ? 99
      : shippingMethod === 'pickup'
      ? 0
      : grandTotal >= 500
      ? 0
      : 49;

  const totalItemsCount = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  const finalGrandTotal = Math.max(0, grandTotal - couponDiscount + shippingCost);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      shippingMethod,
      paymentMethod,
      shippingCost,
      couponDiscount,
      appliedCouponCode: appliedCoupon?.code || null,
      grandTotal: finalGrandTotal,
    };

    if (saveAddressToProfile && userData) {
      dispatch(
        saveUserAddress({
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
        })
      );
    }

    setCheckoutFormData(finalData);
    setShowPopup(true);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    dispatch(applyCouponCode(couponCodeInput.trim()));
    setCouponCodeInput('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="checkout-form mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Address & Preferences (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Saved Address Selector */}
          {savedAddresses.length > 0 && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase">
                ⚡ Select from Saved Addresses
              </label>
              <select
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-medium outline-none"
                value={selectedSavedAddressId}
                onChange={handleSelectSavedAddress}
              >
                <option value="">-- Use a New Address --</option>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} - {a.address}, {a.city} ({a.zip})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3">
              1. Delivery Contact & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  placeholder="e.g. John Doe"
                  {...register('fullName')}
                  className="input-field"
                />
                <p className="error-text">{errors.fullName?.message}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  placeholder="e.g. 9876543210"
                  {...register('phone')}
                  className="input-field"
                />
                <p className="error-text">{errors.phone?.message}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                placeholder="you@example.com"
                {...register('email')}
                className="input-field"
              />
              <p className="error-text">{errors.email?.message}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
              <textarea
                placeholder="House/Flat No, Building, Street, Landmark"
                rows={2}
                {...register('address')}
                className="input-field"
              />
              <p className="error-text">{errors.address?.message}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                <input placeholder="City" {...register('city')} className="input-field" />
                <p className="error-text">{errors.city?.message}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <input placeholder="State" {...register('state')} className="input-field" />
                <p className="error-text">{errors.state?.message}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ZIP / PIN *</label>
                <input placeholder="110001" {...register('zip')} className="input-field" />
                <p className="error-text">{errors.zip?.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="saveAddressCheckbox"
                type="checkbox"
                checked={saveAddressToProfile}
                onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                className="rounded text-emerald-800 focus:ring-emerald-800"
              />
              <label htmlFor="saveAddressCheckbox" className="text-xs text-gray-700 font-medium cursor-pointer">
                Save this address in my address book for future orders
              </label>
            </div>
          </div>

          {/* Shipping & Payment Options */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b pb-3">
              2. Shipping & Payment Method
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Shipping Speed</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${shippingMethod === 'standard' ? 'border-emerald-700 bg-emerald-50/50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs text-gray-900">Standard Delivery</span>
                  <span className="text-[11px] text-gray-500 mt-1">3-5 Business Days</span>
                  <span className="font-bold text-xs text-emerald-800 mt-2">
                    {grandTotal >= 500 ? 'FREE' : '₹49.00'}
                  </span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${shippingMethod === 'express' ? 'border-emerald-700 bg-emerald-50/50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs text-gray-900">⚡ Express Delivery</span>
                  <span className="text-[11px] text-gray-500 mt-1">1-2 Business Days</span>
                  <span className="font-bold text-xs text-emerald-800 mt-2">₹99.00</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between ${shippingMethod === 'pickup' ? 'border-emerald-700 bg-emerald-50/50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={shippingMethod === 'pickup'}
                    onChange={() => setShippingMethod('pickup')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs text-gray-900">Store Pickup</span>
                  <span className="text-[11px] text-gray-500 mt-1">Same Day Ready</span>
                  <span className="font-bold text-xs text-emerald-800 mt-2">FREE</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2">Payment Preference</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 ${paymentMethod === 'cod' ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-emerald-800 focus:ring-emerald-800"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">💵 Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-gray-500">Pay cash upon delivery at your doorstep</span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 ${paymentMethod === 'card' ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-emerald-800 focus:ring-emerald-800"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">💳 Card / Stripe / Online</span>
                    <span className="text-[11px] text-gray-500">Credit/Debit Cards, UPI, Netbanking</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary: Order Price Breakdown & Place Order (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 sticky top-24">
          <h3 className="text-base font-bold text-gray-900 border-b pb-3">
            Order Summary ({totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''})
          </h3>

          {/* Promo Code Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Apply Coupon</label>
            {appliedCoupon ? (
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-950">🏷️ {appliedCoupon.code}</span>
                  <span className="text-emerald-700 ml-2 font-semibold">(-{formatCurrency(couponDiscount)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(removeCouponCode())}
                  className="text-red-600 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="SAVE10, WELCOME20..."
                  className="input-field !py-2 uppercase font-mono text-xs flex-1"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-emerald-900 text-white rounded-xl font-bold text-xs hover:bg-emerald-800"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Pricing Math */}
          <div className="space-y-2 text-xs text-gray-600 border-t pt-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-gray-900">
                {shippingCost === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatCurrency(shippingCost)}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-950 pt-3 border-t">
              <span>Total Payable</span>
              <span className="text-emerald-900 text-lg">{formatCurrency(finalGrandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-800 transition transform hover:-translate-y-0.5"
          >
            Review & Place Order →
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            By placing your order you agree to Shopi&apos;s Terms of Service and Return Policy. 100% money-back guarantee.
          </p>
        </div>
      </div>
    </form>
  );
}
