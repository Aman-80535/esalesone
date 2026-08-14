'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { fetchAllAdminOrders, fetchAllAdminUsers, updateOrderStatusAdmin } from '@/redux/user/userActions';
import { fetchProducts } from '@/redux/user/userActions';
import { formatCurrency } from '@/utils/common';
import Loader from '../components/common/Loader';
import moment from 'moment';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { adminOrders = [], adminUsers = [], products = [], loading } = useSelector((s) => s.user);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      await Promise.all([
        dispatch(fetchAllAdminOrders()),
        dispatch(fetchAllAdminUsers()),
        dispatch(fetchProducts()),
      ]);
      setDataLoading(false);
    };
    loadAll();
  }, [dispatch]);

  const totalRevenue = adminOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);

  const totalOrders = adminOrders.length;
  const totalProducts = products.length;
  const totalUsers = adminUsers.length;

  const pendingOrders = adminOrders.filter((o) => (o.status || 'pending').toLowerCase() === 'pending');
  const lowStockProducts = products.filter((p) => Number(p.stock || 0) <= 5);
  const recentOrders = adminOrders.slice(0, 8);

  const handleStatusChange = async (orderId, newStatus) => {
    await dispatch(updateOrderStatusAdmin({ orderId, status: newStatus }));
    dispatch(fetchAllAdminOrders());
  };

  if (dataLoading) {
    return <Loader text="Loading dashboard metrics..." />;
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome to the Shopi Store Management Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="btn-admin-primary">
            + Add Product
          </Link>
          <Link href="/admin/orders" className="btn-admin-sm !py-2 !px-4 !font-semibold">
            View All Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Total Revenue</h3>
            <p>{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="admin-stat-icon">💰</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Total Orders</h3>
            <p>{totalOrders}</p>
          </div>
          <div className="admin-stat-icon">🛍️</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Products</h3>
            <p>{totalProducts}</p>
          </div>
          <div className="admin-stat-icon">📦</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Customers</h3>
            <p>{totalUsers}</p>
          </div>
          <div className="admin-stat-icon">👥</div>
        </div>
      </div>

      {/* Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Orders Box */}
        <div className="admin-card !mb-0">
          <div className="admin-card-header">
            <h2>⏳ Pending Orders ({pendingOrders.length})</h2>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">All caught up! No pending orders.</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-gray-600 text-xs">{order.fullName || 'Customer'}</p>
                  </div>
                  <span className="font-bold text-emerald-800">{formatCurrency(order.grandTotal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Box */}
        <div className="admin-card !mb-0 lg:col-span-2">
          <div className="admin-card-header">
            <h2>⚠️ Inventory Alerts (Low Stock)</h2>
            <Link href="/admin/products" className="text-sm text-emerald-700 font-semibold">
              Manage Stock →
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">All products have healthy inventory levels.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={p?.images?.[0] || p?.image || '/placeholder.png'}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold text-xs text-gray-900 truncate max-w-[160px]">{p.name || p.title}</p>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold">
                    {p.stock || 0} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-emerald-700 font-semibold">
            View All ({totalOrders}) →
          </Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs font-bold text-gray-800">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td>
                      <div className="font-semibold text-gray-900">{order.fullName || 'Customer'}</div>
                      <div className="text-xs text-gray-500">{order.email || order.phone || '-'}</div>
                    </td>
                    <td className="text-xs text-gray-600">
                      {order.date ? moment(order.date).format('DD/MM/YYYY hh:mm A') : '-'}
                    </td>
                    <td className="text-sm">{order.items?.length || 1} items</td>
                    <td className="font-bold text-emerald-800">{formatCurrency(order.grandTotal)}</td>
                    <td>
                      <span className={`badge-status badge-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="text-xs border rounded p-1 bg-white font-medium"
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
