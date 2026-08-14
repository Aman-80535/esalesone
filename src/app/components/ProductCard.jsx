"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
} from "@/redux/cart/cartAction";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/wishlist/wishlistAction";
import { formatCurrency, simpleNotify } from "@/utils/common";

function getCategorySlug(product) {
  const cat = product?.category?.name ?? product?.category ?? "latest";
  return String(cat).toLowerCase();
}

export default function ProductCard({ product, showWishlist = true }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: cartItems = [] } = useSelector((s) => s.cart);
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist || {});
  const [actionLoading, setActionLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const category = getCategorySlug(product);
  const imageSrc =
    product?.images?.[0] || product?.image || "/placeholder.png";

  const inCart = cartItems.find((ci) => ci.id === product.id || ci.cartItemId?.startsWith(product.id));
  const inWishlist = wishlistItems.some((i) => i.id === product.id);

  const goToProduct = () => {
    router.push(`/product/${category}/${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e?.stopPropagation();
    try {
      await dispatch(
        addToCart({
          ...product,
          size: "M",
          quantity: 1,
        })
      );
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrement = async (e) => {
    e?.stopPropagation();
    setActionLoading(true);
    try {
      await dispatch(incrementQuantity(inCart?.cartItemId || product.id));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecrement = async (e) => {
    e?.stopPropagation();
    setActionLoading(true);
    try {
      await dispatch(decrementQuantity(inCart?.cartItemId || product.id));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e?.stopPropagation();
    try {
      if (inWishlist) {
        await dispatch(removeFromWishlist(product.id));
      } else {
        await dispatch(addToWishlist(product));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = product.name || product.title;
  const price = Number(product.price || 0);
  const mrp = Number(product.mrp || 0);
  const savings = mrp > price ? mrp - price : 0;
  const isOutOfStock = (product.stock ?? 1) <= 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      {/* Product Image & Badges */}
      <div
        className="relative h-64 w-full bg-gray-50 overflow-hidden cursor-pointer flex items-center justify-center p-2"
        onClick={goToProduct}
      >
        <img
          src={imageSrc}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
        />

        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">
            {product.discount}% OFF
          </span>
        )}

        <span
          className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${
            isOutOfStock
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </span>

        {showWishlist && (
          <button
            type="button"
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition shadow-md ${
              inWishlist
                ? "bg-red-50 text-red-500 scale-110"
                : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
            }`}
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {inWishlist ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider mb-1">
            <span>{category}</span>
            <span className="font-semibold text-amber-500">
              ⭐ {(Number(product.rate) || 4.5).toFixed(1)}
            </span>
          </div>

          <h3
            className="font-bold text-gray-900 text-base leading-snug line-clamp-1 cursor-pointer hover:text-emerald-800 transition"
            onClick={goToProduct}
            title={displayName}
          >
            {displayName}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {product.description || product.title}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-black text-gray-950">
                {formatCurrency(price)}
              </span>
              {mrp > price && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  {formatCurrency(mrp)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Save {formatCurrency(savings)}
              </span>
            )}
          </div>

          {/* Add to Cart / Quantity Controller */}
          {inCart && inCart.quantity > 0 ? (
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-1 border border-emerald-200">
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white text-emerald-900 font-bold shadow-sm flex items-center justify-center hover:bg-emerald-100 disabled:opacity-50"
                onClick={handleDecrement}
                disabled={actionLoading}
              >
                -
              </button>
              <span className="font-bold text-sm text-emerald-950">
                {inCart.quantity} in cart
              </span>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white text-emerald-900 font-bold shadow-sm flex items-center justify-center hover:bg-emerald-100 disabled:opacity-50"
                onClick={handleIncrement}
                disabled={actionLoading}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-900 text-white hover:bg-emerald-800 shadow-md"
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {justAdded ? "✓ Added to Cart!" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
