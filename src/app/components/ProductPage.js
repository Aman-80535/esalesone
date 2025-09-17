"use client"

import { addToCart, decrementQuantity, fetchCart, incrementQuantity, removeFromCart } from '@/redux/cart/cartAction';
import { checkEmptiness, errorNotify, simpleNotify } from '@/utils/common';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import BackButton from './BackBUtton';
import { useRouter } from 'next/navigation';
import "../styles/viewproduct.css"

const ProductPage = ({ product }) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const [size, setSelected] = useState('');
	const [color, setSelectedColor] = useState('');
	const [productCartData, setproductCartData] = useState(null);
	const [errors, setErrors] = useState(null);
	const { items, error, loading } = useSelector((state) => state.cart);

	const addToCartProduct = async () => {
		if (checkEmptiness({ size }, setErrors)) return;
		try {
			const addd = await dispatch(addToCart({ ...product, size: size, quantity: 1 }));
		} catch (error) {
			console.error("Error fetching products:", error.message);
			// errorNotify("Something went wrong while adding to cart");
		}
	};

	useEffect(() => {
		items.find(itm => itm.id === product.id) && setproductCartData(items.find(itm => itm.id === product.id))
	}, [items])

	const handleAddToCart = async () => {
		if (checkEmptiness({ size }, setErrors)) return;
		addToCartProduct();
	};
	console.log(errors, "errors")

	const removeItemFromCart = async (itemID) => {
		try {
			await dispatch(removeFromCart(itemID))
		}
		catch (error) {
			console.log(error.message)
		}
	}

	const handleDecrement = async (itemID) => {
		try {
			if (productCartData?.quantity === 0) return;
			if (productCartData?.quantity === 1) {
				setproductCartData(null)
				return dispatch(removeItemFromCart(itemID));
			}
			dispatch(decrementQuantity(itemID))
		}
		catch (error) {
			console.log(error.message)
		}
	}
	const handleIncrement = async (itemID, qty = 0) => {
		try {
			if (checkEmptiness({ size }, setErrors)) return;
			if (qty === 0) return handleAddToCart();
			await dispatch(incrementQuantity(itemID))
		}
		catch (error) {
			console.log(error.message)
		}
	}

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
							src={product?.image}
							alt={product?.title}
							className="w-72 h-72 object-contain rounded-lg shadow-md border bg-gray-50 p-4"
						/>
					</div>

					{/* Right: Product Details */}
					<div className="flex flex-col">
						{/* Title + Manufacturer */}
						<div>
							<h1 className="text-3xl font-bold text-gray-800">{product?.title}</h1>
							<p className="text-gray-500 mt-1">
								by {product?.manufacturer || "Generic Brand"}
							</p>
						</div>

						{/* Price + Demand */}
						<div className="mt-4">
							<p className="text-2xl font-semibold text-green-600">₹{product?.price}</p>
							<p className="text-sm text-orange-500 mt-1">
								🔥 In demand: {product?.demandPercentage || 78}%
							</p>
						</div>

						{/* Stock + Colors + Sizes */}
						<div className="mt-6 space-y-4">
							<p className="text-gray-700">
								<span className="font-semibold">Stock:</span> {product?.stock || 24} units
							</p>

							{/* Colors */}
							{/* <div>
								<span className="font-semibold text-gray-700">Available Colors:</span>
									{errors?.color && <div className='error-normal'>{errors?.color} !</div>}
								<div className="flex gap-2 mt-2">
									{product.colors?.map((colorr, idx) => (
										<span
											onClick={() => setSelectedColor(colorr)}
											key={idx}
											className={`${color === colorr ? "selected-color" : ""} color-selection w-6 h-6 rounded-full border shadow-sm`}
											style={{ backgroundColor: colorr }}
										></span>

									)) || (
											<>
												<span onClick={() => setSelectedColor("red")} className={` ${color === "red" ? "selected-color " : ""} color-selection w-6 h-6 rounded-full bg-red-500  shadow-sm`}></span>

												<span onClick={() => setSelectedColor("blue")} className={`${color === "blue" ? "selected-color " : ""} color-selection w-6 h-6 rounded-full bg-blue-500  shadow-sm`}></span>
												<span onClick={() => setSelectedColor("black")} className={`${color === "black" ? "selected-color " : ""} color-selection w-6 h-6 rounded-full bg-black  shadow-sm`}></span>
											</>
										)}
								</div>
							</div> */}

							{/* Sizes */}
							<div>
								<span className="font-semibold text-gray-700">Sizes:</span>
								<div className="flex gap-3 mt-2">
									{["S", "M", "L", "XL"].map((sizee) => (
										<span
											onClick={() => setSelected(sizee)}
											key={sizee}
											className={`px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer ${sizee === size ? 'bg-gray-200 border-black font-semibold' : ''}`}
										>
											{sizee}
										</span>
									))}
								</div>
								{errors?.size && <div className='error-normal'>{errors?.size}</div>}
							</div>
						</div>

						{/* Description */}
						<p className="mt-3 text-gray-600 leading-relaxed">
							{product?.description}
						</p>

						{/* Manufacturer Location */}
						<p className="mt-4 text-sm text-gray-500">
							📍 Manufactured in {product?.location || "India"}
						</p>
						{/* CTA */}
						<div className="mt-6 flex gap-4 items-center">
							<button className="cart-btn bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 shadow" onClick={handleAddToCart}>
								Add to Cart
							</button>

							<div

								style={{
									display: "flex",
									gap: "8px",
									justifyContent: "center",
								}}
							>
								<button
									className='rounded-3xl'
									style={{ background: "var(--global-background)", width: "39px", height: "39px", borderRadius: "50%" }}
									onClick={() => handleDecrement(product?.id)}
								>
									-
								</button>
								<div className='p-2'><p><b>{productCartData?.quantity || 0}</b></p></div>
								{/* {loading ? "..." : productCartData?.quantity ? productCartData?.quantity : 0} */}
								<button style={{ background: "var(--global-background)", width: "39px", height: "39px", borderRadius: "50%" }} onClick={() => handleIncrement(product?.id, productCartData?.quantity)}>+</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div >


	)
}

export default ProductPage