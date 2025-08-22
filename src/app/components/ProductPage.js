"use client"

import { addToCart, fetchCart } from '@/redux/cart/cartAction';
import { errorNotify, simpleNotify } from '@/utils/common';
import React from 'react'
import { useDispatch } from 'react-redux';
import BackButton from './BackBUtton';
import { useRouter } from 'next/navigation';

const ProductPage = ({ product }) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const addToCartProduct = async () => {
		try {
			const addd = dispatch(addToCart(product));
			simpleNotify("Product added");
		} catch (error) {
			console.error("Error fetching products:", error.message);
			errorNotify("Something went wrong while adding to cart");
		}
	};

	const handleAddToCart = async () => {
		addToCartProduct();
	};


	return (
		<div className="product-view-container flex justify-center items-center min-h-screen bg-gray-100 py-5 px-4">
			<div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
				<div className='p-6'>
					<BackButton onClick={() => router.push('/')} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">

					{/* Left: Product Image */}
					<div className="flex justify-center items-center">
						<img
							src={product.image}
							alt={product.title}
							className="w-72 h-72 object-contain rounded-lg shadow-md border bg-gray-50 p-4"
						/>
					</div>

					{/* Right: Product Details */}
					<div className="flex flex-col">
						{/* Title + Manufacturer */}
						<div>
							<h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
							<p className="text-gray-500 mt-1">
								by {product.manufacturer || "Generic Brand"}
							</p>
						</div>

						{/* Price + Demand */}
						<div className="mt-4">
							<p className="text-2xl font-semibold text-green-600">₹{product.price}</p>
							<p className="text-sm text-orange-500 mt-1">
								🔥 In demand: {product.demandPercentage || 78}%
							</p>
						</div>

						{/* Stock + Colors + Sizes */}
						<div className="mt-6 space-y-4">
							<p className="text-gray-700">
								<span className="font-semibold">Stock:</span> {product.stock || 24} units
							</p>

							{/* Colors */}
							<div>
								<span className="font-semibold text-gray-700">Available Colors:</span>
								<div className="flex gap-2 mt-2">
									{product.colors?.map((color, idx) => (
										<span
											key={idx}
											className="w-6 h-6 rounded-full border shadow-sm"
											style={{ backgroundColor: color }}
										></span>
									)) || (
											<>
												<span className="w-6 h-6 rounded-full bg-red-500 border shadow-sm"></span>
												<span className="w-6 h-6 rounded-full bg-blue-500 border shadow-sm"></span>
												<span className="w-6 h-6 rounded-full bg-black border shadow-sm"></span>
											</>
										)}
								</div>
							</div>

							{/* Sizes */}
							<div>
								<span className="font-semibold text-gray-700">Sizes:</span>
								<div className="flex gap-3 mt-2">
									{["S", "M", "L", "XL"].map((size) => (
										<span
											key={size}
											className="px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
										>
											{size}
										</span>
									))}
								</div>
							</div>
						</div>

						{/* Description */}
						<p className="mt-6 text-gray-600 leading-relaxed">
							{product.description}
						</p>

						{/* Manufacturer Location */}
						<p className="mt-4 text-sm text-gray-500">
							📍 Manufactured in {product.location || "India"}
						</p>

						{/* CTA */}
						<div className="mt-6 flex gap-4">
							<button className="cart-btn bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 shadow" onClick={handleAddToCart}>
								Add to Cart
							</button>

						</div>
					</div>
				</div>
			</div>
		</div>


	)
}

export default ProductPage