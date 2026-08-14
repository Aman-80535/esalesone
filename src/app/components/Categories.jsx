'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Categories() {
  const router = useRouter();
  const { products = [] } = useSelector((s) => s.user);

  const categories = [
    {
      name: "Men",
      slug: "men",
      subtitle: "Shirts, Jeans, Hoodies",
      image:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Women",
      slug: "women",
      subtitle: "Dresses, Tops, Denim",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Latest",
      slug: "latest",
      subtitle: "Fresh Seasonal Drops",
      image:
        "https://images.unsplash.com/photo-1521335629791-ce4aec67dd15?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Sale",
      slug: "sale",
      subtitle: "Up to 50% Off Deals",
      badge: "HOT DEALS",
      image:
        "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const getCategoryCount = (slug) => {
    return products.filter((p) => {
      const cat = String(p.category?.name ?? p.category ?? '').toLowerCase();
      return cat.includes(slug.toLowerCase());
    }).length;
  };

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
            Collections
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
            Shop By Category
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat, index) => {
          const count = getCategoryCount(cat.slug);
          return (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gray-900"
              onClick={() => router.push(`/product/${cat.slug}`)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-56 md:h-72 w-full object-cover group-hover:scale-108 transition duration-700 opacity-90 group-hover:opacity-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {cat.badge && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full shadow">
                  {cat.badge}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold !text-white leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                  {count > 0 && (
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">
                      {count} items
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}