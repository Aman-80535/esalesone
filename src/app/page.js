
import { HomePage } from "./components/HomePage";
export const dynamic = 'force-dynamic';


async function getProducts() {
  try {
    // const res = await fetch('https://fakestoreapi.com/products', { cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : [];

  }
  catch (err) {
    console.log(err)
  }
}

export default async function Home() {
  // const products = await getProducts();

  return <HomePage  />;
}
