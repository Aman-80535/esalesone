'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '@/redux/user/userActions';
import Link from 'next/link';
import Loader from '@/app/components/common/Loader';

const CATEGORIES_INFO = [
  {
    name: 'Men',
    slug: 'men',
    description: 'Shirts, Jeans, T-shirts, Hoodies, and formal menswear',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Women',
    slug: 'women',
    description: 'Dresses, Tops, High Waist Denim, Skirts, and luxury fashion',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Latest',
    slug: 'latest',
    description: 'Fresh arrivals, new season drop, sneakers, and smart accessories',
    image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd15?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sale',
    slug: 'sale',
    description: 'Flash deals, discounted tees, sneakers, and seasonal specials',
    image: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=800&q=80',
  },
];

export default function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { products = [], loading } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getProductCount = (slug) => {
    return products.filter((p) => {
      const cat = String(p.category?.name ?? p.category ?? '').toLowerCase();
      return cat.includes(slug.toLowerCase());
    }).length;
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1>Store Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of product category collections and active catalog distribution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES_INFO.map((cat) => {
          const count = getProductCount(cat.slug);
          return (
            <div key={cat.slug} className="admin-card !p-0 overflow-hidden flex flex-col">
              <div className="relative h-44 w-full bg-gray-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                  {count} products
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <Link
                    href={`/product/${cat.slug}`}
                    className="text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    View Storefront →
                  </Link>
                  <Link
                    href="/admin/products"
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Manage Items
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
