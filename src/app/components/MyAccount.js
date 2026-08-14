'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateUserProfile, saveUserAddress, deleteUserAddress, fetchUserData } from '@/redux/user/userActions';
import { fetchUserOrders } from '@/redux/cart/cartAction';
import { fetchWishlist } from '@/redux/wishlist/wishlistAction';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { isAdminEmail } from '@/utils/admin';
import Loader from './common/Loader';
import { formatCurrency, simpleNotify } from '@/utils/common';

export const MyAccount = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData, token, loading } = useSelector((state) => state.user);
  const { orderList = [] } = useSelector((state) => state.cart);
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, profile, addresses

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Address Form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchUserData());
      dispatch(fetchUserOrders());
      dispatch(fetchWishlist());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (userData) {
      setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
      });
    }
  }, [userData]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateUserProfile(profileForm));
    dispatch(fetchUserData());
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    await dispatch(saveUserAddress(addressForm));
    setShowAddressModal(false);
    setAddressForm({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    });
    dispatch(fetchUserData());
  };

  const handleDeleteAddress = async (id) => {
    if (confirm('Delete this saved address?')) {
      await dispatch(deleteUserAddress(id));
      dispatch(fetchUserData());
    }
  };

  const displayName = userData
    ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    : 'Shopi Customer';

  const userEmail = userData?.email || user?.email;
  const isUserAdmin = isAdminEmail(userEmail, userData);
  const savedAddresses = userData?.addresses || [];

  if (!token && !user) {
    return (
      <div className="min-h-[70vh] bg-[#f4f7f6] flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            👤
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Sign in to your Account</h2>
          <p className="text-xs text-gray-500 mt-2">
            Access your order history, saved delivery addresses, and wishlist.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full py-3.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="w-full py-3.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7f6] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {(displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-950">
                  {displayName || 'Customer'}
                </h1>
                {isUserAdmin && (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-black rounded-full uppercase">
                    👑 ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
              {userData?.phone && <p className="text-xs text-gray-400">📞 {userData.phone}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUserAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
              >
                Admin Panel →
              </Link>
            )}
            <button
              type="button"
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 border-b">
          <button
            type="button"
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Account Overview
          </button>

          <button
            type="button"
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            ✏️ Edit Profile
          </button>

          <button
            type="button"
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
            onClick={() => setActiveTab('addresses')}
          >
            📍 Address Book ({savedAddresses.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link
                href="/myorders"
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">Orders Placed</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{orderList.length}</p>
                </div>
                <span className="text-3xl">📦</span>
              </Link>

              <Link
                href="/wishlist"
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">Wishlist Items</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{wishlistItems.length}</p>
                </div>
                <span className="text-3xl">❤️</span>
              </Link>

              <div
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition"
                onClick={() => setActiveTab('addresses')}
              >
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">Saved Addresses</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{savedAddresses.length}</p>
                </div>
                <span className="text-3xl">🏡</span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Link href="/myorders" className="text-xs font-bold text-emerald-800 hover:underline">
                  View All Orders →
                </Link>
              </div>

              {orderList.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No recent purchases found.</p>
              ) : (
                <div className="space-y-3">
                  {orderList.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-gray-50 rounded-2xl border flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold text-gray-900">#{order.id}</p>
                        <p className="text-gray-500 mt-0.5">
                          {order.items?.length || 1} items • {formatCurrency(order.grandTotal)}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg uppercase text-[10px]">
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b">
              Edit Account Information
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="input-field !bg-gray-100 cursor-not-allowed"
                  value={userEmail}
                />
                <p className="text-[11px] text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  className="input-field"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800 mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Address Book */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Saved Delivery Addresses</h3>
                <p className="text-xs text-gray-500">Manage shipping destinations for quick checkout</p>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
                onClick={() => setShowAddressModal(true)}
              >
                + Add New Address
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                <p className="text-sm font-semibold text-gray-700">No saved addresses yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Add your primary delivery address for faster checkout.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                        <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Home / Work
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{addr.address}</p>
                      <p className="text-xs text-gray-600">
                        {addr.city}, {addr.state} - <span className="font-bold">{addr.zip}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">📞 {addr.phone}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-end">
                      <button
                        type="button"
                        className="text-xs font-bold text-red-600 hover:underline"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        Delete Address
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Address Modal */}
        {showAddressModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddressModal(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                Add New Delivery Address
              </h3>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Receiver Name"
                      className="input-field"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="10-digit Phone"
                      className="input-field"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Flat No, Building, Street"
                    className="input-field"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ZIP / PIN *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-900 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-800"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
