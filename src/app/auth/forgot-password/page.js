'use client';

import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import { app } from '@/firebase';
import Link from 'next/link';
import { simpleNotify, successNotify, errorNotify } from '@/utils/common';

const auth = getAuth(app);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      successNotify('Password reset instructions sent to your email.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Could not find an account with this email address. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#f4f7f6]">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black shadow-sm">
          🔑
        </div>
        <h1 className="text-2xl font-extrabold text-gray-950">Reset Password</h1>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Enter your registered email address to receive a secure recovery link
        </p>

        {sent ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
            <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
              We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <div className="text-left">
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-800 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>

            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/auth/login"
                className="text-xs text-emerald-900 font-bold hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
