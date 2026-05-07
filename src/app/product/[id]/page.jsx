import React from "react";
import ProductPage from "@/app/components/ProductPage";
import "../../styles/viewproduct.css";
import { getProductById } from "@/redux/product/productAction";

async function getProduct(id) {
  const res = await getProductById(id);
  return res;
}

export default async function ProductViewPage({ params }) {
  const resolvedParams = await params;

  const id = resolvedParams?.id;

  if (!id) {
    return <div>Invalid product ID</div>;
  }

  const product = await getProduct(id);

  return <ProductPage product={product} />;
}