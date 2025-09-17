
import React from "react";
import ProductPage from "@/app/components/ProductPage";
import '../../styles/viewproduct.css';
import { getProductById } from "@/redux/product/productAction";

async function getProduct(id) {
  const res = await getProductById(id);
  return res;
}

export default async function ProductViewPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <ProductPage product={product} />
  );
}
