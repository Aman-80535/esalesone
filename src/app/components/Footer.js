'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { successNotify } from '@/utils/common';
import '../styles/footer.css';

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      successNotify('Thank you for subscribing to Shopi newsletters! 🎉');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="site-footer bg-[#092e24] text-emerald-100 mt-16 pt-16 pb-8 border-t border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-800/50">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
              <img src="/shopi-logo.png" alt="LIBAAS" className="w-9 h-9 object-contain" />
              <span>Shopi<span className="text-emerald-400">.</span></span>
            </Link>
            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm">
              Your premier destination for trend-setting fashion, streetwear essentials, and timeless wardrobe staples. Delivered with speed and care.
            </p>

            {/* Newsletter form */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                Subscribe for Exclusive Drops & Deals
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  className="px-3.5 py-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-white placeholder-emerald-400/60 outline-none focus:border-emerald-400 flex-1"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-500 text-emerald-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links: Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-xs text-emerald-200/80">
              <li><Link href="/product/men" className="hover:text-white transition">Men&apos;s Fashion</Link></li>
              <li><Link href="/product/women" className="hover:text-white transition">Women&apos;s Fashion</Link></li>
              <li><Link href="/product/latest" className="hover:text-white transition">New Arrivals</Link></li>
              <li><Link href="/product/sale" className="text-amber-300 font-semibold hover:text-amber-200 transition">Flash Sale 🔥</Link></li>
              <li><Link href="/categories" className="hover:text-white transition">All Categories</Link></li>
            </ul>
          </div>

          {/* Quick Links: Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-emerald-200/80">
              <li><Link href="/myorders" className="hover:text-white transition">Track My Order</Link></li>
              <li><Link href="/myaccount" className="hover:text-white transition">My Profile & Addresses</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
              <li><Link href="/order" className="hover:text-white transition">Checkout</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Support & Admin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Store & Admin</h4>
            <ul className="space-y-2.5 text-xs text-emerald-200/80">
              <li><Link href="/admin" className="text-emerald-300 font-semibold hover:text-white transition">Admin Portal 👑</Link></li>
              <li><Link href="/admin/products" className="hover:text-white transition">Inventory Manager</Link></li>
              <li><Link href="/admin/orders" className="hover:text-white transition">Store Orders</Link></li>
              <li><Link href="/auth/forgot-password" className="hover:text-white transition">Password Recovery</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/60">
          <p>&copy; {year} Shopi E-Commerce Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span>🔒 256-Bit SSL Encrypted Checkout</span>
            <span>🚚 Express Delivery Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
