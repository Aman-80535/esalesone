'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { formatCurrency, simpleNotify, successNotify } from '@/utils/common';
import Loader from '@/app/components/common/Loader';

const DEFAULT_COUPONS = [
  { code: 'SAVE10', discountType: 'percentage', value: 10, minAmount: 0, description: '10% off on all orders' },
  { code: 'WELCOME20', discountType: 'percentage', value: 20, minAmount: 100, description: '20% off on orders above ₹100' },
  { code: 'FLAT50', discountType: 'fixed', value: 50, minAmount: 200, description: 'Flat ₹50 off on orders above ₹200' },
  { code: 'FREESHIP', discountType: 'shipping', value: 0, minAmount: 0, description: 'Free Standard Delivery' },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: 10,
    minAmount: 0,
    description: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      if (snap.empty) {
        setCoupons(DEFAULT_COUPONS);
      } else {
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCoupons(loaded);
      }
    } catch (err) {
      console.warn('Coupon fetch error:', err);
      setCoupons(DEFAULT_COUPONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        value: Number(formData.value),
        minAmount: Number(formData.minAmount || 0),
        description: formData.description.trim() || `${formData.value}${formData.discountType === 'percentage' ? '%' : '₹'} discount`,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'coupons'), payload);
      successNotify(`Coupon ${payload.code} created!`);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (confirm(`Delete coupon "${code}"?`)) {
      try {
        if (id) {
          await deleteDoc(doc(db, 'coupons', id));
        }
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        simpleNotify(`Coupon ${code} removed`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Coupon & Promo Code Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage promotional discount codes for store shoppers.
          </p>
        </div>
        <button className="btn-admin-primary" onClick={() => setIsModalOpen(true)}>
          + Create Coupon
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <Loader text="Loading coupons..." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Promo Code</th>
                  <th>Discount Type</th>
                  <th>Discount Value</th>
                  <th>Min Order</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td>
                      <span className="font-mono font-bold text-sm bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-300">
                        {c.code}
                      </span>
                    </td>
                    <td className="capitalize text-sm font-semibold text-gray-700">
                      {c.discountType}
                    </td>
                    <td className="font-bold text-emerald-800">
                      {c.discountType === 'percentage'
                        ? `${c.value}% OFF`
                        : c.discountType === 'fixed'
                        ? `₹${c.value} OFF`
                        : 'Free Delivery'}
                    </td>
                    <td className="text-sm">
                      {c.minAmount > 0 ? formatCurrency(c.minAmount) : 'No Minimum'}
                    </td>
                    <td className="text-sm text-gray-600">{c.description}</td>
                    <td className="text-right">
                      <button
                        className="btn-admin-sm btn-admin-danger"
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">Create New Promo Code</h2>
            <form onSubmit={handleAddCoupon}>
              <div className="admin-form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER30"
                  className="admin-form-input uppercase font-mono font-bold"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Discount Type *</label>
                  <select
                    className="admin-form-select"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="admin-form-input"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="admin-form-input"
                  placeholder="0 for no minimum"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Description / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 30% discount on all seasonal items"
                  className="admin-form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="btn-admin-sm !py-2 !px-4"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
