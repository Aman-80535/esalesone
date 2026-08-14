'use client';

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import '../styles/Home.css';
import { fetchProducts } from "@/redux/user/userActions";
import { useLoader } from "@/context/LoaderContext";
import { formatCurrency } from "@/utils/common";
import { useRouter } from "next/navigation";
import SocialPage from "./SocialPage";
import HeroSection from "./HeroSection";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import { fetchWishlist } from "@/redux/wishlist/wishlistAction";
import Loader from "./common/Loader";

export const HomePage = () => {
  const { products: productsData = [], loading: productsLoading, error } = useSelector((s) => s.user);
  const [searchKey, setSearchKey] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!productsData?.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, productsData?.length]);

  useEffect(() => {
    if (token) dispatch(fetchWishlist());
  }, [dispatch, token]);

  const products = productsData || [];

  // Filter products by search key and category chip
  let filteredData = products.filter((item) => {
    const q = searchKey.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item?.title || "").toLowerCase().includes(q) ||
      (item?.name || "").toLowerCase().includes(q) ||
      String(item?.category?.name ?? item?.category ?? "").toLowerCase().includes(q);

    const itemCat = String(item?.category?.name ?? item?.category ?? "").toLowerCase();
    const matchesCategory =
      selectedCategory === "all" || itemCat.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Sorting
  if (sortBy === "price-asc") {
    filteredData = [...filteredData].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortBy === "price-desc") {
    filteredData = [...filteredData].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (sortBy === "rating") {
    filteredData = [...filteredData].sort((a, b) => (Number(b.rate) || 0) - (Number(a.rate) || 0));
  } else if (sortBy === "discount") {
    filteredData = [...filteredData].sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
  } else if (sortBy === "name") {
    filteredData = [...filteredData].sort((a, b) =>
      (a.name || a.title || "").localeCompare(b.name || b.title || "")
    );
  }

  const inDemand = products.filter((p) => (p.rate >= 4.5 || p.discount >= 25)).slice(0, 4);

  return (
    <div className="bg-[#f2f7f5] min-h-screen">
      <HeroSection />
      <Categories />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending / In Demand Section */}
        {inDemand.length > 0 && !searchKey && selectedCategory === 'all' && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  Trending Now
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
                  In High Demand 🔥
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {inDemand.map((product) => (
                <ProductCard key={`trending-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Main Product Catalog Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Explore All Products
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Showing {filteredData.length} of {products.length} products
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {['all', 'men', 'women', 'latest', 'sale'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? '✨ All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 my-6 justify-between items-stretch sm:items-center">
            <input
              className="search-product bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 max-w-md focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
              placeholder="Search in product catalog..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort by:</span>
              <select
                className="rounded-xl px-4 py-2.5 border border-gray-200 bg-white text-sm font-medium outline-none focus:border-emerald-600"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated ⭐</option>
                <option value="discount">Biggest Discounts %</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Grid / Loader */}
          {productsLoading && !products.length ? (
            <Loader text="Loading fresh catalog..." />
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-800">No products found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your filters. Try clearing search or selecting a different category.
              </p>
              <button
                type="button"
                className="mt-4 px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold"
                onClick={() => {
                  setSearchKey('');
                  setSelectedCategory('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredData.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <SocialPage />
      </div>
    </div>
  );
};
