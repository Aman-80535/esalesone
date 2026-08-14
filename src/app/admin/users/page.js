'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAdminUsers } from '@/redux/user/userActions';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { simpleNotify, successNotify } from '@/utils/common';
import Loader from '@/app/components/common/Loader';
import moment from 'moment';

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { adminUsers = [], loading } = useSelector((s) => s.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchAllAdminUsers());
  }, [dispatch]);

  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        isAdmin: newRole === 'admin',
      });
      successNotify(`User role updated to ${newRole}`);
      dispatch(fetchAllAdminUsers());
    } catch (err) {
      console.error('Error toggling admin:', err);
    }
  };

  const filteredUsers = adminUsers.filter((user) => {
    const query = searchTerm.toLowerCase().trim();
    return (
      !query ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.firstName || '').toLowerCase().includes(query) ||
      (user.lastName || '').toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Customer & User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total Registered Users: {adminUsers.length}
          </p>
        </div>
        <button
          className="btn-admin-sm !py-2 !px-4"
          onClick={() => dispatch(fetchAllAdminUsers())}
        >
          🔄 Refresh Users
        </button>
      </div>

      {/* Search Filter */}
      <div className="admin-card !p-4 !mb-6">
        <input
          type="text"
          className="admin-form-input !max-w-md"
          placeholder="Search user by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="admin-card">
        {loading && !adminUsers.length ? (
          <Loader text="Loading user accounts..." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Saved Addresses</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Shopi Customer';
                    const isAdmin = user.role === 'admin' || user.isAdmin === true;
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 leading-snug">{fullName}</p>
                              <p className="text-xs text-gray-400 font-mono">UID: {user.id.slice(0, 10)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-gray-700">{user.email || '-'}</td>
                        <td>
                          <span
                            className={`badge-status ${
                              isAdmin ? 'badge-delivered' : 'badge-processing'
                            }`}
                          >
                            {isAdmin ? '👑 ADMIN' : 'CUSTOMER'}
                          </span>
                        </td>
                        <td className="text-xs text-gray-600">
                          {user.addresses?.length || 0} address(es)
                        </td>
                        <td className="text-right">
                          <button
                            className="btn-admin-sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            View
                          </button>
                          <button
                            className={`btn-admin-sm ${
                              isAdmin ? 'btn-admin-danger' : '!bg-emerald-50 !text-emerald-800'
                            }`}
                            onClick={() => handleToggleAdmin(user.id, user.role)}
                          >
                            {isAdmin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">User Profile</h2>
            <div className="p-4 bg-gray-50 rounded-xl mb-4 text-sm space-y-2">
              <p><strong>Name:</strong> {selectedUser.firstName || ''} {selectedUser.lastName || ''}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role || 'user'}</p>
              <p><strong>UID:</strong> {selectedUser.id}</p>
            </div>

            <h4 className="font-bold text-gray-800 text-sm mb-2">Saved Addresses ({selectedUser.addresses?.length || 0})</h4>
            {(!selectedUser.addresses || selectedUser.addresses.length === 0) ? (
              <p className="text-gray-500 text-xs italic">No saved delivery addresses.</p>
            ) : (
              <div className="space-y-2 mb-6">
                {selectedUser.addresses.map((a, i) => (
                  <div key={i} className="p-3 border rounded-lg text-xs bg-white">
                    <p className="font-bold text-gray-800">{a.fullName || 'Address'}</p>
                    <p className="text-gray-600">{a.address}, {a.city}, {a.state} {a.zip}</p>
                    <p className="text-gray-500">Phone: {a.phone || '-'}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="btn-admin-sm !py-2 !px-4"
                onClick={() => setSelectedUser(null)}
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
