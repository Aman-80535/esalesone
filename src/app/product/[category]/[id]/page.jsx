import React from "react";
import ProductPage from "@/app/components/ProductPage";
import { getProducts } from "@/redux/product/productAction";
import Link from "next/link";

async function getProduct(id) {
  try {
    const res = await getProducts({ id });
    return res;
  } catch (error) {
    console.error("Error getting product by id:", error);
    return null;
  }
}

export default async function ProductViewPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Invalid Product ID</h2>
        <Link href="/" className="mt-4 px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold text-xs">
          Back to Store
        </Link>
      </div>
    );
  }

  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">
          The item you are looking for may have been removed or is temporarily unavailable.
        </p>
        <Link href="/" className="mt-6 px-6 py-3 bg-emerald-800 text-white rounded-xl font-bold text-xs">
          Browse All Products
        </Link>
      </div>
    );
  }

  return <ProductPage product={product} />;
}