import ProductCatPage from "@/app/components/ProductCatPage";
import { getProducts } from "@/redux/product/productAction";

async function getProduct(category) {
  try {
    const res = await getProducts({ category });
    return res || [];
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}

export default async function ProductCatPageIdx({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams?.category || "all";
  const product = await getProduct(category);

  return <ProductCatPage products={product} category={category} />;
}