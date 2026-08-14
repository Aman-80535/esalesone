'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchWishlist, removeFromWishlist } from '@/redux/wishlist/wishlistAction';
import { addToCart } from '@/redux/cart/cartAction';
import ProductCard from '@/app/components/ProductCard';
import Loader from '@/app/components/common/Loader';
import BackButton from '@/app/components/BackBUtton';
import Link from 'next/link';
import { simpleNotify } from '@/utils/common';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items = [], loading } = useSelector((s) => s.wishlist || {});
  const { token } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch, token]);

  const handleAddAllToCart = async () => {
    for (const item of items) {
      await dispatch(addToCart({ ...item, quantity: 1, size: 'M' }));
    }
    simpleNotify('All wishlist items added to cart!');
  };

  return (
    <div className="bg-[#f2f7f5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Back */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton onClick={() => router.push('/')} />
          <nav className="text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-emerald-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-bold">My Wishlist</span>
          </nav>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
                My Wishlist <span>❤️</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {items.length} saved item{items.length !== 1 ? 's' : ''} in your personal collection
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                className="px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800 transition"
                onClick={handleAddAllToCart}
              >
                + Add All to Cart
              </button>
            )}
          </div>

          <div className="mt-8">
            {loading && !items.length ? (
              <Loader text="Loading your saved wishlist..." />
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🤍
                </div>
                <h3 className="text-lg font-bold text-gray-800">Your wishlist is currently empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Save items you love by clicking the heart icon on any product card while browsing.
                </p>
                <button
                  type="button"
                  className="mt-6 px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800"
                  onClick={() => router.push('/')}
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
