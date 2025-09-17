import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";


export const getProductById = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const data = { id: productSnap.id, ...productSnap.data() };
      console.log("Product data:", data);
      return data;
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};