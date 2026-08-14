'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import '../styles/Carousel.css';

const slides = [
  {
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    title: "New Season Drops",
    subtitle: "Discover the latest fashion arrivals crafted with premium fabrics and modern tailoring.",
    action: "/product/latest",
    cta: "Explore Drop",
  },
  {
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
    title: "Elevate Your Style",
    subtitle: "Timeless fits, jackets, streetwear essentials, and contemporary silhouettes.",
    action: "/product/men",
    cta: "Shop Men",
  },
  {
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    title: "Exclusive Flash Deals",
    subtitle: "Up to 50% discount on select high-demand fashion favorites. Limited quantity.",
    action: "/product/sale",
    cta: "Shop Sale",
  },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mai-carousel relative mx-auto overflow-hidden rounded-2xl shadow-xl max-w-7xl my-6">
      <div
        className="flex transition-transform ease-out duration-700 h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full flex-shrink-0 h-full relative min-h-[380px] md:min-h-[460px]">
            <img
              src={slide.img}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover block brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            <div className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 text-white max-w-xl pr-4">
              <span className="inline-block px-3 py-1 bg-emerald-600/90 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Featured Spotlight
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                {slide.title}
              </h2>
              <p className="mt-3 text-sm md:text-base text-gray-200 leading-relaxed max-w-md">
                {slide.subtitle}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href={slide.action}
                  className="shop-cta px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  {slide.cta} →
                </Link>
                <Link
                  href="/categories"
                  className="shop-outline px-5 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition"
                >
                  All Categories
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Arrows */}
      <div className="carousel-btns">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          className="arrow left-arrow"
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5">
            <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          className="arrow right-arrow"
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5">
            <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-emerald-400' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}