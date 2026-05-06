'use client'

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/redux/cart/cartAction";
import CartPopup from "./CartPopup";
import { CiShoppingCart } from "react-icons/ci";
import { fetchUserData, logoutUser } from "@/redux/user/userActions";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FaBox, FaBoxOpen, FaRegUserCircle, FaUserCircle } from "react-icons/fa";
import '../../../src/app/styles/header.css';
import { CgProfile } from "react-icons/cg";

export const Header = () => {
	const { items } = useSelector((state) => state.cart);
	const { userData, token } = useSelector((state) => state.user);
	const dispatch = useDispatch();

	const [isOpen, setIsOpen] = useState(false); // Cart popup
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu flag
	const [isMobileView, setIsMobileView] = useState(false);

	const router = useRouter();

	const togglePopup = () => setIsOpen(!isOpen);

	async function handleLogoutUser(e) {
		e.preventDefault();
		dispatch(logoutUser());
		router.push('/');
	}

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsMobileView(true);
		}

		if (typeof window !== 'undefined') {
			const fetchData = async () => {
				if (token) {
					await dispatch(fetchUserData(token));
				}
			};
			fetchData();
		}
	}, [dispatch, token]);

	return (
		<nav className="nav-main shadow-md header-first">
			<div className="header-first max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 gap-4">
					{/* Brand */}
					<Link href="/" className="brand-head flex items-center gap-3 text-xl font-bold">
						<img src="/shopi-logo.png" alt="Shopi" className="brand-logo" />
						<span>Shopi</span>
					</Link>

					{/* Search (desktop) */}
					

					<div className="nav-bar flex items-center">

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMobileMenuOpen(prev => !prev)}
							className="md:hidden inline-flex items-center justify-center p-2 rounded-md  focus:outline-none"
						>
							{isMobileMenuOpen ? (
								// X icon
								<div onClick={() => setIsOpen(false)}>

									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</div>
							) : (
								// Hamburger icon
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							)}
						</button>

						{/* Desktop Menu */}
						<div className="hidden md:flex space-x-4 items-center">
							{userData?.email && (
								<span className="user-email">{userData.email}</span>
							)}

							{token && (
								<Link href="/myorders" className="icon-btn has-tooltip" data-tooltip="My Orders" title="My Orders">
									<FaBox />
								</Link>
							)}

							<Link href="/myaccount" className="icon-btn has-tooltip" data-tooltip="My Account" title="My Account">
								<CgProfile />
							</Link>

							<button className="icon-btn has-tooltip" data-tooltip="Cart" onClick={() => setIsOpen(p => !p)} title="Cart">
								<CiShoppingCart />
								{items?.length > 0 && token && (
									<span className="badge">{items?.length}</span>
								)}
							</button>
						</div>

					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMobileView && isMobileMenuOpen && (
                <div className="mobile-bar absolute top-15 right-0 md:hidden px-4 py-4 pb-4 space-y-3 bg-white/95 backdrop-blur-sm rounded-b-lg shadow-md">
					{userData?.email && (
						<span className="block text-gray-700">{userData.email}</span>
					)}

					{token && (
						<>
							<Link href="/myorders" className="fa-box relative flex items-center text-gray-700 hover:text-blue-600 text-2xl">
								<FaBox className="w-6 h-6" />
								<span className="fa-box decoration-wavy text-xl text-2xl   fa-box-mob">My Orders</span>
							</Link>
						</>
					)}
					{/* My Account */}
					<Link href="/myaccount" className="fa-box profiel-icon cg-mob  relative flex items-center text-gray-700 hover:text-blue-600 text-2xl">
						<CgProfile className="w-6 h-6" />
						<span className="fa-box decoration-wavy text-xl text-2xl   fa-box-mob">My profile</span>

					</Link>



					<Link href="#" className="cart-icon  relative flex items-center text-gray-700 hover:text-blue-600 text-2xl" onClick={() => setIsOpen(p => !p)}>
						{/* Cart Icon */}
						<CiShoppingCart className="w-8 h-8" />
						<span className="fa-box decoration-wavy text-xl text-2xl   fa-box-mob">My Cart</span>


						{/* Badge Counter */}
						{items?.length > 0 && token && (
							<span className="count-length ml-2  bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
								{items.length}
							</span>
						)}
					</Link>
				</div>
			)}

			<CartPopup setIsOpen={setIsOpen} isOpen={isOpen} togglePopup={togglePopup} />
		</nav>
	);
};