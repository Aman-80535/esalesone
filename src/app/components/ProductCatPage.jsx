"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import BackButton from "./BackBUtton";
import Link from "next/link";
import { formatCurrency } from "@/utils/common";

function ProductCatPage({ products = [], category = "" }) {
  const [filteredData, setFilteredData] = useState(products || []);
  const [sortBy, setSortBy] = useState("default");
  const [searchKey, setSearchKey] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setFilteredData(products || []);
  }, [products]);

  let displayProducts = (filteredData || []).filter((item) => {
    const q = searchKey.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item?.title || "").toLowerCase().includes(q) ||
      (item?.name || "").toLowerCase().includes(q);

    const matchesStock = !inStockOnly || Number(item?.stock ?? 1) > 0;

    return matchesSearch && matchesStock;
  });

  if (sortBy === "price-asc") {
    displayProducts = [...displayProducts].sort(
      (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
    );
  } else if (sortBy === "price-desc") {
    displayProducts = [...displayProducts].sort(
      (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)
    );
  } else if (sortBy === "rating") {
    displayProducts = [...displayProducts].sort(
      (a, b) => (Number(b.rate) || 0) - (Number(a.rate) || 0)
    );
  } else if (sortBy === "discount") {
    displayProducts = [...displayProducts].sort(
      (a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0)
    );
  }

  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "All Products";

  return (
    <div className="bg-[#f2f7f5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton onClick={() => router.push("/")} />
          <nav className="text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-emerald-800">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-emerald-800">Categories</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-bold capitalize">{categoryLabel}</span>
          </nav>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 capitalize">
                {categoryLabel} Collection
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Showing {displayProducts.length} premium styles
              </p>
            </div>

            {/* In-stock Filter */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                In-Stock Only
              </label>
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 my-6 justify-between items-stretch sm:items-center">
            <input
              className="search-product bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 max-w-md focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
              placeholder={`Search within ${categoryLabel}...`}
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort:</span>
              <select
                className="rounded-xl px-4 py-2.5 border border-gray-200 bg-white text-sm font-medium outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated ⭐</option>
                <option value="discount">Biggest Discount %</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {displayProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                👗
              </div>
              <h3 className="text-lg font-bold text-gray-800">No products found in {categoryLabel}</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Try searching for other items or browse all catalog products.
              </p>
              <button
                type="button"
                className="mt-4 px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700"
                onClick={() => router.push("/")}
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCatPage;
