
import React from "react";
import ProductPage from "@/app/components/ProductPage";
import '../../styles/viewproduct.css';

async function getProduct(id) {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
    cache: "no-store", // for always fresh data
  });
  return res.json();
}

export default async function ProductViewPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <ProductPage product={product}/>
  );
}
