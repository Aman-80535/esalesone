"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Carousel from "./Carausel";

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="w-full">
      <Carousel />

      {/* Value Proposition Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 px-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🚚</span>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">Free Delivery</p>
              <p className="text-[11px] text-gray-500">On all eligible orders</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">✨</span>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">100% Genuine</p>
              <p className="text-[11px] text-gray-500">Directly sourced</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🔄</span>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">Easy Returns</p>
              <p className="text-[11px] text-gray-500">7-day return policy</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🔒</span>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">Secure Payment</p>
              <p className="text-[11px] text-gray-500">Card, UPI & COD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
