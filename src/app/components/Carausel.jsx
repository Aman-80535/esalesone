import React, { useState, useEffect } from "react";
import '../styles/Carousel.css';

// High-quality Unsplash images (men's fashion) — stable hotlinking and free-to-use license
const images = [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1600&q=80",
    "https://images.pexels.com/photos/1030975/pexels-photo-1030975.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
];

export default function Carousel({ action }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto slide every 4s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mai-carousel relative mx-auto overflow-hidden rounded-2xl shadow-lg">
            {/* Slides container (horizontal) */}
            <div
                className="flex transition-transform ease-in-out duration-700 h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((src, i) => (
                    <div key={i} className="w-full flex-shrink-0 h-full relative">
                        <img
                            src={src}
                            alt={`Slide ${i + 1}`}
                            className="w-full h-full object-cover block"
                            onError={(e) => {
                                // fallback to local images in /public if remote fails
                                const fallbacks = ["/clothes1.jpg", "/clothes2.jpg", "/clothes3.jpg"];
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallbacks[i % fallbacks.length];
                            }}
                        />

                        {/* Dark gradient overlay for readable text */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Content overlay */}
                        <div className="absolute left-20 top-1/2 -translate-y-1/2 text-white max-w-lg">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow">Men&apos;s Classic Collection</h2>
                            <p className="mt-2 text-sm md:text-base text-white/90">Premium fits, timeless styles — discover jackets, shirts and essentials.</p>
                            <div className="mt-4 flex items-center gap-3">
                                <href className="shop-cta px-5 py-2 rounded-md font-semibold" href={action}>Shop Men's</href>
                                <href className="shop-outline px-4 py-2 rounded-md"  href={action}>Explore</href>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className=" absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`dot ${i === currentIndex ? 'active' : ''}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Arrows */}
            <div className="carousel-btns">
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="arrow left-arrow"
                    aria-label="Previous slide"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                    className="arrow right-arrow"
                    aria-label="Next slide"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}