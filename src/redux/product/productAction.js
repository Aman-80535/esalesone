import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { errorNotify, successNotify } from "@/utils/common";

export const getProducts = async ({ id, category = "" } = {}) => {
  try {
    // 1. Get single product by ID
    if (id) {
      const ref = doc(db, "products", id.toString());
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        throw new Error("Product not found");
      }

      return {
        id: snap.id,
        ...snap.data(),
      };
    }

    // 2. Get products by category
    if (category) {
      const formattedCategory = category.trim().toLowerCase();

      // If 'all', return all products
      if (formattedCategory === "all") {
        const allSnap = await getDocs(collection(db, "products"));
        return allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      const q = query(
        collection(db, "products"),
        where("category", "==", formattedCategory)
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (products.length > 0) return products;

      // Fallback: match flexibly client-side in case category has differing case
      const allSnap = await getDocs(collection(db, "products"));
      const allProducts = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      return allProducts.filter((p) => {
        const catVal = String(p?.category?.name ?? p?.category ?? "").toLowerCase();
        return catVal.includes(formattedCategory);
      });
    }

    // 3. If neither id nor category is provided, fetch all products
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// Admin Product CRUD functions
export const createAdminProduct = async (productData) => {
  try {
    const productsRef = collection(db, "products");
    const docRef = await addDoc(productsRef, {
      ...productData,
      price: Number(productData.price || 0),
      mrp: Number(productData.mrp || productData.price || 0),
      stock: Number(productData.stock || 10),
      discount: Number(productData.discount || 0),
      rate: Number(productData.rate || 5),
      createdAt: serverTimestamp(),
    });
    successNotify("Product created successfully!");
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("createAdminProduct error:", error);
    errorNotify(error.message || "Failed to create product");
    throw error;
  }
};

export const updateAdminProduct = async (id, productData) => {
  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      ...productData,
      price: Number(productData.price || 0),
      mrp: Number(productData.mrp || productData.price || 0),
      stock: Number(productData.stock || 0),
      discount: Number(productData.discount || 0),
      updatedAt: serverTimestamp(),
    });
    successNotify("Product updated successfully!");
    return { id, ...productData };
  } catch (error) {
    console.error("updateAdminProduct error:", error);
    errorNotify(error.message || "Failed to update product");
    throw error;
  }
};

export const deleteAdminProduct = async (id) => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
    successNotify("Product deleted successfully!");
    return id;
  } catch (error) {
    console.error("deleteAdminProduct error:", error);
    errorNotify(error.message || "Failed to delete product");
    throw error;
  }
};

// Product Reviews & Ratings
export const getProductReviews = async (productId) => {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("productId", "==", productId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().date || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("getProductReviews notice:", error);
    return [];
  }
};

export const addProductReview = async ({ productId, rating, comment, userName, userEmail }) => {
  try {
    const reviewsRef = collection(db, "reviews");
    const docRef = await addDoc(reviewsRef, {
      productId,
      rating: Number(rating),
      comment: comment.trim(),
      userName: userName || "Anonymous Customer",
      userEmail: userEmail || "",
      createdAt: serverTimestamp(),
      date: new Date().toISOString(),
    });

    // Optionally update product average rating
    try {
      const existingReviews = await getProductReviews(productId);
      const totalRatings = existingReviews.reduce((sum, r) => sum + Number(r.rating || 5), Number(rating));
      const avgRating = totalRatings / (existingReviews.length + 1);

      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        rate: Number(avgRating.toFixed(1)),
      });
    } catch (e) {}

    successNotify("Review submitted! Thank you.");
    return {
      id: docRef.id,
      productId,
      rating,
      comment,
      userName,
      date: new Date().toISOString(),
    };
  } catch (error) {
    console.error("addProductReview error:", error);
    errorNotify(error.message || "Failed to submit review");
    throw error;
  }
};