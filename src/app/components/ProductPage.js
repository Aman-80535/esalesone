"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addToCart,
  decrementQuantity,
  incrementQuantity,
} from "@/redux/cart/cartAction";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/wishlist/wishlistAction";
import { addProductReview, getProductReviews } from "@/redux/product/productAction";
import { formatCurrency, simpleNotify, successNotify } from "@/utils/common";
import BackButton from "./BackBUtton";
import ProductCard from "./ProductCard";
import "../styles/viewproduct.css";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductPage({ product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: cartItems = [] } = useSelector((state) => state.cart);
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});
  const { products = [], userData } = useSelector((state) => state.user);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : product?.image
    ? [product.image]
    : ["/placeholder.png"];

  const cartItemId = `${product?.id}-${selectedSize}`;
  const inCart = cartItems.find((ci) => ci.cartItemId === cartItemId || ci.id === product?.id);
  const inWishlist = wishlistItems.some((i) => i.id === product?.id);

  const price = Number(product?.price || 0);
  const mrp = Number(product?.mrp || 0);
  const savings = mrp > price ? mrp - price : 0;
  const stock = Number(product?.stock ?? 15);
  const isOutOfStock = stock <= 0;

  useEffect(() => {
    if (product?.id) {
      setReviewsLoading(true);
      getProductReviews(product.id).then((revs) => {
        setReviews(revs);
        setReviewsLoading(false);
      });
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    try {
      await dispatch(
        addToCart({
          ...product,
          size: selectedSize,
          quantity: quantity,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/order");
  };

  const handleToggleWishlist = async () => {
    if (inWishlist) {
      await dispatch(removeFromWishlist(product.id));
    } else {
      await dispatch(addToWishlist(product));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newRev = await addProductReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
        userName: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Verified Buyer' : 'Customer',
        userEmail: userData?.email || '',
      });
      setReviews((prev) => [newRev, ...prev]);
      setReviewComment("");
      setReviewRating(5);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product?.id &&
        String(p.category?.name ?? p.category ?? "").toLowerCase() ===
          String(product?.category?.name ?? product?.category ?? "").toLowerCase()
    )
    .slice(0, 4);

  return (
    <div className="bg-[#f4f7f6] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumbs & Back */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <nav className="text-xs text-gray-500 font-medium">
              <Link href="/" className="hover:text-emerald-800">Home</Link>
              <span className="mx-2">/</span>
              <Link
                href={`/product/${String(product?.category?.name ?? product?.category ?? "latest").toLowerCase()}`}
                className="hover:text-emerald-800 capitalize"
              >
                {String(product?.category?.name ?? product?.category ?? "Category")}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-semibold truncate max-w-[200px] inline-block align-bottom">
                {product?.name || product?.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Product Details Main Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Gallery (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full h-[380px] md:h-[480px] bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border">
                <img
                  src={images[selectedImage] || "/placeholder.png"}
                  alt={product?.name}
                  className="w-full h-full object-cover rounded-xl transition-all duration-300"
                />

                {product?.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow">
                    {product.discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-white transition ${
                    inWishlist ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"
                  }`}
                  onClick={handleToggleWishlist}
                  aria-label="Wishlist"
                >
                  {inWishlist ? "❤️" : "🤍"}
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto py-2 w-full justify-center">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? "border-emerald-700 ring-2 ring-emerald-200"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Purchase Controls (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full capitalize">
                  {String(product?.category?.name ?? product?.category ?? "Fashion")}
                </span>

                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-950 mt-3 leading-tight">
                  {product?.name || product?.title}
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Brand: <span className="font-semibold text-gray-800">{product?.manufacturer || "Shopi Essentials"}</span>
                </p>

                {/* Rating row */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                    ⭐ {(Number(product?.rate) || 4.5).toFixed(1)} / 5.0
                  </div>
                  <span className="text-xs text-gray-500">
                    ({reviews.length} customer review{reviews.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    ✓ Verified Quality
                  </span>
                </div>

                {/* Pricing Box */}
                <div className="p-4 bg-gray-50 rounded-2xl my-6 flex items-baseline gap-4 border border-gray-100">
                  <span className="text-3xl font-black text-gray-950">
                    {formatCurrency(price)}
                  </span>
                  {mrp > price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(mrp)}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      You Save {formatCurrency(savings)}
                    </span>
                  )}
                </div>

                {/* Size Selector */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Select Size:
                    </label>
                    <span className="text-xs text-emerald-800 font-medium">Size Guide</span>
                  </div>
                  <div className="flex gap-2.5">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`w-12 h-12 rounded-xl text-xs font-extrabold transition-all ${
                          selectedSize === sz
                            ? "bg-emerald-900 text-white shadow-md scale-105"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Stock status */}
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg bg-gray-100 font-bold hover:bg-gray-200"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-gray-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg bg-gray-100 font-bold hover:bg-gray-200"
                        onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                        disabled={quantity >= stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                      Stock Status:
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isOutOfStock
                          ? "bg-red-100 text-red-700"
                          : stock <= 5
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : `${stock} units available`}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">About This Product</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product?.description ||
                      "Premium quality fashion wear designed for daily comfort, breathability, and contemporary styling. Machine washable and durable."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-900 text-white font-bold text-sm hover:bg-emerald-800 transition shadow-lg disabled:opacity-50"
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition shadow-lg disabled:opacity-50"
                  onClick={handleBuyNow}
                >
                  ⚡ Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Ratings & Customer Reviews
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Real feedback from verified purchasers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Submit a Review (5 cols) */}
            <div className="lg:col-span-5 bg-gray-50 p-6 rounded-2xl border">
              <h3 className="text-base font-bold text-gray-900 mb-2">Write a Review</h3>
              <p className="text-xs text-gray-500 mb-4">
                Share your thoughts with other shoppers
              </p>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Your Rating:
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition-transform hover:scale-125 ${
                          star <= reviewRating ? "text-amber-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Your Comments:
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="What did you like or dislike about the fit and fabric?"
                    className="w-full p-3 rounded-xl border text-sm outline-none focus:border-emerald-700 bg-white"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-emerald-900 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-800 disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Post Review"}
                </button>
              </form>
            </div>

            {/* Right: Reviews List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {reviewsLoading ? (
                <p className="text-xs text-gray-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border">
                  <p className="text-sm font-semibold text-gray-700">No reviews yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((rev, i) => (
                  <div key={rev.id || i} className="p-4 bg-gray-50 rounded-2xl border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-900">{rev.userName || 'Customer'}</span>
                      <span className="text-amber-500 text-xs font-bold">
                        {"★".repeat(rev.rating || 5)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}