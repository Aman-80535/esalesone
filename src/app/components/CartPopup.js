 'use client';

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/redux/cart/cartAction";
import { applyCouponCode, removeCouponCode } from "@/redux/cart/cartSlice";
import { useRouter } from "next/navigation";
import { CgClose } from "react-icons/cg";
import { formatCurrency } from "@/utils/common";

const CartPopup = ({ setIsOpen, isOpen }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    items = [],
    appliedCoupon,
    couponDiscount = 0,
    error,
  } = useSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState("");

  const closePopup = () => setIsOpen(false);

  const subtotal = items.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const finalTotal = Math.max(0, subtotal - couponDiscount);
  const freeShippingThreshold = 500;
  const amountToFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );
  const freeShippingPercent = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );

  const handleDecrement = (itemId) => {
    dispatch(decrementQuantity(itemId));
  };

  const handleIncrement = (itemId) => {
    dispatch(incrementQuantity(itemId));
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();

    if (!couponInput.trim()) return;

    dispatch(applyCouponCode(couponInput.trim()));
    setCouponInput("");
  };

  const toOrderPage = () => {
    closePopup();
    router.push("/order");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closePopup}
        aria-hidden="true"
      />

      {/* Drawer */}
<div className="fixed inset-y-0 right-0 z-[9999] w-full sm:max-w-md md:max-w-lg h-[90vh]">        <div className="h-full w-full bg-white shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="shrink-0 px-4 py-4 sm:px-5 border-b border-gray-100 bg-[#f8faf9]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-lg sm:text-xl">🛍️</span>

              <h2 className="min-w-0 flex-1 text-base sm:text-lg font-bold text-gray-900 truncate">
                Your Shopping Cart
              </h2>

              <span className="shrink-0 text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-full">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>

              <button
                type="button"
                onClick={closePopup}
                className="shrink-0 p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 text-gray-500 transition"
                aria-label="Close cart"
              >
                <CgClose className="text-lg sm:text-xl" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress */}
          <div className="shrink-0 bg-emerald-50 px-4 py-1 sm:px-2 border-b border-emerald-100">
            {amountToFreeShipping > 0 ? (
              <p className="text-[11px] sm:text-xs leading-5 text-emerald-900 font-medium mb-1.5">
                Add{" "}
                <span className="font-bold">
                  {formatCurrency(amountToFreeShipping)}
                </span>{" "}
                more for <span className="font-bold">FREE Delivery</span>!
              </p>
            ) : (
              <p className="text-[11px] sm:text-xs leading-5 text-emerald-800 font-bold">
                🎉 Congratulations! You unlocked FREE Delivery!
              </p>
            )}

            <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 space-y-3 sm:space-y-4 overscroll-contain">
            {items.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🛒
                </div>

                <h3 className="text-sm sm:text-base font-bold text-gray-800">
                  Your cart is empty
                </h3>

                <p className="text-[11px] sm:text-xs leading-5 text-gray-500 mt-1 max-w-xs mx-auto">
                  Looks like you haven&apos;t added any fashion items yet.
                </p>

                <button
                  type="button"
                  onClick={closePopup}
                  className="mt-5 px-5 sm:px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 active:bg-emerald-900 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemKey = item.cartItemId || item.id;
                const itemImg =
                  item.images?.[0] || item.image || "/placeholder.png";

                return (
                  <div
                    key={itemKey}
                    className="flex gap-3 sm:gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 relative"
                  >
                    <img
                      src={itemImg}
                      alt={item.name || item.title || "Product"}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border bg-white shrink-0"
                    />

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        <div className="flex items-start gap-2">
                          <h4 className="min-w-0 flex-1 font-bold text-xs sm:text-sm leading-5 text-gray-900 line-clamp-2 break-words">
                            {item.name || item.title}
                          </h4>

                          <button
                            type="button"
                            onClick={() => handleRemove(itemKey)}
                            className="shrink-0 w-7 h-7 -mr-1 -mt-1 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Remove"
                            aria-label={`Remove ${item.name || item.title || "item"}`}
                          >
                            ✕
                          </button>
                        </div>

                        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">
                          Size:{" "}
                          <span className="font-bold text-gray-700">
                            {item.size || "M"}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="font-black text-xs sm:text-sm text-gray-900 truncate">
                          {formatCurrency(item.price)}
                        </span>

                        <div className="shrink-0 flex items-center border bg-white rounded-lg p-0.5">
                          <button
                            type="button"
                            className="w-7 h-7 rounded bg-gray-50 text-xs font-bold hover:bg-gray-100 active:bg-gray-200"
                            onClick={() => handleDecrement(itemKey)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>

                          <span className="w-7 text-center text-xs font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            className="w-7 h-7 rounded bg-gray-50 text-xs font-bold hover:bg-gray-100 active:bg-gray-200"
                            onClick={() => handleIncrement(itemKey)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="shrink-0 max-h-[48vh] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 border-t border-gray-100 bg-[#f8faf9] space-y-3 sm:space-y-4">
              {/* Coupon */}
              {appliedCoupon ? (
                <div className="flex items-start justify-between gap-3 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl text-[11px] sm:text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-emerald-900 font-mono break-all">
                      🏷️ {appliedCoupon.code}
                    </span>

                    <span className="text-emerald-700 ml-2 whitespace-nowrap">
                      (-{formatCurrency(couponDiscount)})
                    </span>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 text-red-600 font-bold hover:underline"
                    onClick={() => dispatch(removeCouponCode())}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleApplyCoupon}
                  className="flex flex-col xs:flex-row sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. SAVE10)"
                    className="min-w-0 flex-1 px-3 py-2.5 text-[11px] sm:text-xs font-mono uppercase bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-200"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 active:bg-emerald-950 transition"
                  >
                    Apply
                  </button>
                </form>
              )}

              {error && (
                <p className="text-[11px] sm:text-xs leading-4 text-red-600 font-medium break-words">
                  {error}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-[11px] sm:text-xs text-gray-600">
                <div className="flex justify-between items-center gap-4">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center gap-4 text-emerald-800 font-semibold">
                    <span>Coupon Discount</span>
                    <span className="whitespace-nowrap">
                      -{formatCurrency(couponDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 text-sm sm:text-base font-extrabold text-gray-950 pt-2 border-t">
                  <span>Estimated Total</span>
                  <span className="text-emerald-900 whitespace-nowrap">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout */}
              <button
                type="button"
                className="w-full min-h-12 px-4 py-3 bg-emerald-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg hover:bg-emerald-800 active:bg-emerald-950 transition flex items-center justify-center gap-2 text-center leading-5"
                onClick={toOrderPage}
              >
                <span>Proceed to Checkout</span>
                <span className="whitespace-nowrap">
                  ({formatCurrency(finalTotal)}) →
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPopup;