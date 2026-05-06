
import { HomePage } from "./components/HomePage";

// Use ISR: set a revalidate period so Vercel can statically generate with periodic updates
export const revalidate = 60; // seconds

async function getProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products', { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error('Products fetch failed', res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  catch (err) {
    console.log(err);
    return [];
  }
}

export default async function Home() {
  // Fetch products on the server with ISR to avoid dynamic/no-store behavior
  const products = await getProducts();
  return <HomePage products={products} />;
}
