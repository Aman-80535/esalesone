'use client';

import React, { useState, Suspense } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import Cookies from 'js-cookie';
import { app } from '@/firebase';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { simpleNotify, errorNotify, successNotify } from '@/utils/common';
import { setToken } from '@/redux/user/userSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUserData } from '@/redux/user/userActions';
import { fetchCart } from '@/redux/cart/cartAction';
import { fetchWishlist } from '@/redux/wishlist/wishlistAction';

const auth = getAuth(app);

function LoginFormInner() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      localStorage.setItem('user_uid', user.uid);
      Cookies.set('token', idToken, {
        expires: 7,
        path: '/',
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
      });

      dispatch(setToken(idToken));
      await dispatch(fetchUserData());
      dispatch(fetchCart(user.uid));
      dispatch(fetchWishlist());

      successNotify('Welcome back! Logged in successfully.');
      router.push(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Invalid email or password. Please try again.';
      if (err.code === 'auth/user-not-found') errorMsg = 'No account found with this email.';
      if (err.code === 'auth/wrong-password') errorMsg = 'Incorrect password.';
      if (err.code === 'auth/too-many-requests') errorMsg = 'Too many failed attempts. Try again later.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#f4f7f6]">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black shadow-sm">
            ✨
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950">Welcome Back</h1>
          <p className="text-xs text-gray-500 mt-1">Sign in to your Shopi account to continue</p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-800 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-emerald-800 font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-800 transition"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-gray-800"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-800 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Don&apos;t have an account yet?{' '}
            <Link
              href={redirectPath !== '/' ? `/auth/signup?redirect=${redirectPath}` : '/auth/signup'}
              className="text-emerald-900 font-bold hover:underline ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export const LoginForm = () => {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading login...</div>}>
      <LoginFormInner />
    </Suspense>
  );
};
