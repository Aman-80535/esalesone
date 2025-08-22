import React, { useState, useEffect } from "react";
import '../styles/Carousel.css';

const images = [
    "/clothes1.jpg",
    "/clothes2.jpg",
    "/clothes3.jpg",
];

export default function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto slide every 3s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mai-carousel relative  mx-auto overflow-hidden rounded-2xl shadow-lg">
            {/* Slides */}
            <div
                className="flex transition-transform ease-in-out duration-700"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((src, i) => (
                    <img
                        key={i}
                        src={images[i]}
                        alt={`Slide ${i}`}
                        className="w-full h-[400px] object-cover flex-shrink-0"
                    />
                ))}
            </div>

            {/* Dots */}
            <div className=" absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                    <button
                        key={i}
                        className={`w-3 h-3 rounded-full ${i === currentIndex ? "bg-white" : "bg-gray-400"
                            }`}
                        onClick={() => setCurrentIndex(i)}
                    />
                ))}
            </div>

            {/* Arrows */}
            <div className="carousel-btns">
                <button
                    onClick={() =>
                        setCurrentIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1
                        )
                    }
                    className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full"
                >
                    ◀
                </button>

                <button
                    onClick={() =>
                        setCurrentIndex((prev) => (prev + 1) % images.length)
                    }
                    className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full"
                >
                    ▶
                </button>
            </div>
        </div>
    );
}