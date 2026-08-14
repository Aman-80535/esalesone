'use client';

import React, { useState, Suspense } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app, db } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { simpleNotify, successNotify, errorNotify } from '@/utils/common';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setToken } from '@/redux/user/userSlice';
import { fetchUserData } from '@/redux/user/userActions';

const auth = getAuth(app);

function SignupFormInner() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Save user doc in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: 'user',
        addresses: [],
        createdAt: serverTimestamp(),
      });

      localStorage.setItem('user_uid', user.uid);
      Cookies.set('token', idToken, {
        expires: 7,
        path: '/',
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
      });

      dispatch(setToken(idToken));
      await dispatch(fetchUserData());

      successNotify('Account registered successfully! Welcome to Shopi.');
      router.push(redirectPath);
    } catch (err) {
      console.error('Signup error:', err);
      let errorMsg = 'Failed to create account. Please check your details.';
      if (err.code === 'auth/email-already-in-use') errorMsg = 'An account with this email already exists.';
      if (err.code === 'auth/invalid-email') errorMsg = 'Invalid email address.';
      if (err.code === 'auth/weak-password') errorMsg = 'Password is too weak. Use at least 6 characters.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#f4f7f6]">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black shadow-sm">
            🛍️
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950">Create Account</h1>
          <p className="text-xs text-gray-500 mt-1">Join Shopi for exclusive deals and order tracking</p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min 6 characters"
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

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-800 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-800 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link
              href={redirectPath !== '/' ? `/auth/login?redirect=${redirectPath}` : '/auth/login'}
              className="text-emerald-900 font-bold hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const SignUpForm = () => {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading registration...</div>}>
      <SignupFormInner />
    </Suspense>
  );
};

export default SignUpForm;
