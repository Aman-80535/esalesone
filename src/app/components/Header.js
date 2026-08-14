'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/redux/cart/cartAction";
import CartPopup from "./CartPopup";
import { fetchUserData, logoutUser } from "@/redux/user/userActions";
import { fetchWishlist } from '@/redux/wishlist/wishlistAction';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FaBox, FaShieldAlt } from "react-icons/fa";
import '../styles/header.css';
import {
  CgHeart,
  CgLogOut,
  CgMenuGridO,
  CgProfile,
  CgSearch,
  CgShoppingCart,
} from "react-icons/cg";
import { CiShoppingCart } from "react-icons/ci";
import { isAdminEmail } from "@/utils/admin";
import { useAuth } from "@/context/AuthProvider";

export const Header = () => {
  const { items } = useSelector((state) => state.cart);
  const { userData, token } = useSelector((state) => state.user);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist || {});

  const [isOpen, setIsOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();

  const togglePopup = () => setIsOpen(!isOpen);

  async function handleLogoutUser(e) {
    e.preventDefault();
    await dispatch(logoutUser());
    setIsMobileMenuOpen(false);
    router.push('/');
  }

  useEffect(() => {
    if (token) {
      dispatch(fetchUserData());
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [dispatch, token]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setShowSearchInput(false);
      setIsMobileMenuOpen(false);
    }
  };

  const userEmail = userData?.email || user?.email;
  const isUserAdmin = isAdminEmail(userEmail, userData);
  const totalCartCount = (items || []).reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

  const navLinks = (
    <>
      {isUserAdmin && (
        <Link
          href="/admin"
          className="icon-btn has-tooltip !bg-emerald-900 !text-white"
          data-tooltip="Admin Panel"
          title="Admin Panel"
        >
          <FaShieldAlt className="text-amber-300" />
        </Link>
      )}

      {token && (
        <Link
          href="/myorders"
          className="icon-btn has-tooltip"
          data-tooltip="My Orders"
          title="My Orders"
        >
          <FaBox />
        </Link>
      )}

      <Link
        href="/myaccount"
        className="icon-btn has-tooltip"
        data-tooltip="My Account"
        title="My Account"
      >
        <CgProfile />
      </Link>

      <button
        type="button"
        className="icon-btn has-tooltip relative"
        data-tooltip="Wishlist"
        title="Wishlist"
        onClick={() => router.push('/wishlist')}
      >
        <CgHeart />
        {wishlistItems?.length > 0 && (
          <span className="badge">{wishlistItems.length}</span>
        )}
      </button>

      <button
        type="button"
        className="icon-btn has-tooltip"
        data-tooltip="Search"
        title="Search"
        onClick={() => setShowSearchInput((s) => !s)}
      >
        <CgSearch />
      </button>

      <Link
        href="/categories"
        className="icon-btn has-tooltip"
        data-tooltip="Categories"
        title="Categories"
      >
        <CgMenuGridO />
      </Link>

      <button
        type="button"
        className="icon-btn has-tooltip relative"
        data-tooltip="Shopping Cart"
        onClick={() => setIsOpen((p) => !p)}
        title="Cart"
      >
        <CiShoppingCart className="text-xl" />
        {totalCartCount > 0 && (
          <span className="badge">{totalCartCount}</span>
        )}
      </button>

      {token ? (
        <button
          type="button"
          className="icon-btn has-tooltip text-red-600 hover:text-red-700"
          data-tooltip="Logout"
          title="Logout"
          onClick={handleLogoutUser}
        >
          <CgLogOut />
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="icon-btn has-tooltip font-bold !w-auto !px-3 text-xs"
          data-tooltip="Sign In"
          title="Login"
        >
          Sign In
        </Link>
      )}
    </>
  );

  return (
    <nav className="nav-main shadow-md sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="brand-head flex items-center gap-2 text-2xl font-black tracking-tight">
            <img src="/ChatGPT Image Aug 14, 2026, 11_33_05 PM.png" alt="LIBAAS" className="brand-logo" />
            <span className="text-emerald-950 font-black">LIBAAS<span className="text-emerald-600">.</span></span>
          </Link>

          {/* Quick Categories Bar (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/product/men" className="hover:text-emerald-800 transition">Men</Link>
            <Link href="/product/women" className="hover:text-emerald-800 transition">Women</Link>
            <Link href="/product/latest" className="hover:text-emerald-800 transition">Latest</Link>
            <Link href="/product/sale" className="text-amber-600 font-bold hover:text-amber-700 transition">Sale 🔥</Link>
          </div>

          <div className="nav-bar flex items-center gap-2">
            {showSearchInput && (
              <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
                <input
                  className="header-search bg-gray-50 border border-gray-200 focus:bg-white text-sm"
                  placeholder="Search 1,000+ fashion styles..."
                  value={searchValue}
                  autoFocus
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button type="submit" className="add-cart-btn px-4 py-2 text-xs font-bold">
                  Go
                </button>
              </form>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-emerald-900 bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Icons */}
            <div className="hidden md:flex space-x-1.5 items-center">
              {userData?.firstName ? (
                <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full mr-1">
                  Hi, {userData.firstName}
                </span>
              ) : null}
              {navLinks}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-5 space-y-4 shadow-xl z-50 animate-fadeIn">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              className="header-search !w-full text-sm"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button type="submit" className="add-cart-btn px-4 py-2 text-xs">
              Go
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-center text-sm font-semibold pt-2 border-t">
            <Link
              href="/product/men"
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-emerald-50 text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              👕 Men
            </Link>
            <Link
              href="/product/women"
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-emerald-50 text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              👗 Women
            </Link>
            <Link
              href="/product/latest"
              className="p-2.5 bg-gray-50 rounded-lg hover:bg-emerald-50 text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✨ Latest
            </Link>
            <Link
              href="/product/sale"
              className="p-2.5 bg-amber-50 text-amber-900 rounded-lg hover:bg-amber-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🔥 Sale
            </Link>
          </div>

          <div className="space-y-2 pt-2 border-t text-sm font-medium">
            {isUserAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-900 text-white font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaShieldAlt className="text-amber-300" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {token && (
              <Link
                href="/myorders"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaBox className="text-emerald-700" />
                <span>My Orders</span>
              </Link>
            )}

            <Link
              href="/myaccount"
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CgProfile className="text-emerald-700 text-lg" />
              <span>My Account</span>
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <CgHeart className="text-emerald-700 text-lg" />
                <span>My Wishlist</span>
              </div>
              {wishlistItems?.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 text-left"
              onClick={() => {
                setIsOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <CiShoppingCart className="text-emerald-700 text-xl" />
                <span>My Cart</span>
              </div>
              {totalCartCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-700 text-white text-xs font-bold rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>

            {token ? (
              <button
                type="button"
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-red-600 hover:bg-red-50 text-left font-semibold"
                onClick={handleLogoutUser}
              >
                <CgLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="block text-center py-2.5 bg-emerald-800 text-white font-bold rounded-lg mt-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}

      <CartPopup setIsOpen={setIsOpen} isOpen={isOpen} togglePopup={togglePopup} />
    </nav>
  );
};
