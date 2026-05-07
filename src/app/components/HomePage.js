'use client'

import { addToCart, fetchCart } from "@/redux/cart/cartAction";
import { useState, useEffect } from "react";
import { chekItem } from "@/redux/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import '../styles/Home.css';
import { fetchProducts } from "@/redux/user/userActions";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoader } from "@/context/LoaderContext";
import { simpleNotify } from "@/utils/common";
import { useRouter } from "next/navigation";
import SocialPage from "./SocialPage";
import Carousel from "./Carausel";
import { incrementQuantity, decrementQuantity } from '@/redux/cart/cartAction';
import { ToastContainer } from "react-toastify";


export const HomePage = ({ products: serverProducts = [] }) => {
	const [showSplash, setShowSplash] = useState(true);

	useEffect(() => {
		// show splash for 900ms then hide
		const t = setTimeout(() => setShowSplash(false), 900);
		return () => clearTimeout(t);
	}, []);
	const { products: productsData = [], loading: Loading, error } = useSelector(s => s.user)
	// prefer client-side redux products when available, otherwise fall back to server-provided products
	const products = (productsData && productsData.length) ? productsData : (serverProducts || []);
	const [justAddedMap, setJustAddedMap] = useState({});
	const [searchKey, setSearchKey] = useState("");
	const [filteredData, setFilteredData] = useState(products);
	const [Error, setError] = useState("");
	const dispatch = useDispatch();
	const { items: cartItems, loading: cartLoading } = useSelector((s) => s.cart);
	const [actionLoadingMap, setActionLoadingMap] = useState({});
	const { loading, setLoading } = useLoader();
	const router = useRouter()

	useEffect(() => {
		// If redux already has products, skip fetching to avoid redundant network calls
		if (productsData && productsData.length) return;

		const fetchData = async () => {
			try {
				setLoading(true);
				await dispatch(fetchProducts());
			} catch (err) {
				simpleNotify('Error fetching products');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);


	console.log("prodd", products)

	useEffect(() => {
		if (searchKey.trim() === "") {
			setFilteredData(products);
		} else {
			console.log(products)
			const filtered = products.filter((item) =>
				item.title.toLowerCase().includes(searchKey.toLowerCase())
			);
			setFilteredData(filtered);
		}

	}, [searchKey, products]);


	const handleSearch = (value) => {
		setSearchKey(value);
	};

	const addToCartProduct = async (product) => {
		try {
			const addd = dispatch(addToCart(product));
			dispatch(fetchCart());
		} catch (error) {
			console.error("Error fetching products:", error.message);
			setError(error);
		}
	};

	const handleAddToCart = async (e, product) => {

		e.stopPropagation();
		addToCartProduct(product);
	};

	const setActionLoading = (id, value) => setActionLoadingMap(prev => ({ ...prev, [id]: value }));

	const handleIncrementOnCard = async (product) => {
		setActionLoading(product.id, true);
		try {
			await dispatch(incrementQuantity(product.id));
		} catch (err) { console.error(err); }
		finally { setActionLoading(product.id, false); }
	}

	const handleDecrementOnCard = async (product) => {
		setActionLoading(product.id, true);
		try {
			await dispatch(decrementQuantity(product.id));
		} catch (err) { console.error(err); }
		finally { setActionLoading(product.id, false); }
	}

	if (error) {
		return simpleNotify(error.message)
	}

	const handleClick = (id) => {
		router.push(`product/${id}`);
	};

	return (
		<>
			{showSplash && (
				<div className="splash-overlay">
					<div className="splash-logo">Shopi <span className="dot-wrap">{[1, 2, 3].map(i => (
							<span key={i} className="dot-flashing" />
						))}</span></div>
				</div>
			)}


			<div className="px-3 header-first flex items-center justify-center py-2">
				<Carousel action={"#search-container"} />
			</div>
			<div className="hidden md:flex flex-1 justify-center mt-5" id='search-container'>
				<input
					className="header-search"
					placeholder="Search t-shirts, tees, prints..."
					value={searchKey}
					onChange={(event) => handleSearch(event.target.value)}
					onClick={() => {/* keep for future wiring */ }}
				/>
			</div>

			<div className="main-container py-2 px-3 mt-3">
				<div className="internal-container px-4 py-2">
					{/* Featured / In Demand row */}
					<div className="featured-section mt-3">
						<h2 className="featured-title"><img src="/shopi-logo.png" alt="Shopi" className="section-logo" />In Demand</h2>
						<div className="featured-row">
							{(products || []).slice(0, 6).map((p) => (
								<div key={p.id} className="featured-card" onClick={() =>{
									handleClick(p.id);
								}}>
									<div className="featured-media">
										<img src={p?.images?.[0] || p.image || "/placeholder.png"} alt={p.name} />
										{p.discount && <span className="discount-badge">{p.discount}% OFF</span>}
									</div>
									<div className="featured-body">
										<div className="featured-name">{p.name}</div>
										<div className="featured-meta">
											<div className="featured-price">${Number(p.price || 0).toFixed(2)}</div>
											<button className="add-cart-btn" onClick={(e) => {
												e.stopPropagation();
												handleAddToCart(e, p);
												// show temporary added message for 2 seconds
												setJustAddedMap(prev => ({ ...prev, [p.id]: true }));
												setTimeout(() => setJustAddedMap(prev => { const next = { ...prev }; delete next[p.id]; return next }), 2000);
											}}> {justAddedMap[p.id] ? "Added!" : "Add"}</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
						<div className=" mt-4">
							<h2 className="featured-title"><img src="/shopi-logo.png" alt="Shopi" className="section-logo" />Usuals</h2>
						<div className="row" style={{ justifyContent: "center", gap: "80px" }}>
							{(filteredData).map((product) =>
							(
								<div className="card-parent col-lg-3 d-flex flex-col col-md-4 col-sm-6 col-6 mb-4" key={product.id}>
									<div className="card" style={{ height: "100%" }}>
										<div className="card-media" onClick={() => handleClick(product.id)}>
											<img
												src={product?.images?.[0] || product.image || "/placeholder.png"}
												alt={product.name}
												className="card-img-top"
												style={{ height: "220px", objectFit: "cover" }}
											/>
											{product.discount && (
												<span className="discount-badge">{product.discount}% OFF</span>
											)}
										</div>
										<div className="card-body p-3 ">
											<p className="card-category">{product.category?.name}</p>
											<p className="card-title">{product.name}</p>
											<p className="card-desc">{product.title}</p>
											<div className="card-meta mt-3 flex items-center justify-between">
												<div>
													<span className="price">${product.price}</span>
													{product.mrp && (
														<span className="mrp">${product.mrp}</span>
													)}
												</div>

												{/* Show quantity controls if product exists in cart */}
												{(() => {
													const inCart = cartItems?.find(ci => ci.id === product.id);
													const isActionLoading = actionLoadingMap[product.id];
													if (inCart && inCart.quantity > 0) {
														return (
															<div className="flex items-center gap-3">
																<button className="rounded-full" style={{ background: "var(--global-background)", width: "36px", height: "36px" }} onClick={() => handleDecrementOnCard(product)} disabled={!!isActionLoading}>
																	{isActionLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : '-'}
																</button>
																<div className="p-1"><b>{inCart.quantity}</b></div>
																<button className="rounded-full" style={{ background: "var(--global-background)", width: "36px", height: "36px" }} onClick={() => handleIncrementOnCard(product)} disabled={!!isActionLoading}>
																	{isActionLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : '+'}
																</button>
															</div>
														)
													}
													return <button className="add-cart-btn" onClick={(e) => handleAddToCart(e, product)}>Add to cart</button>
												})()}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div>
					<SocialPage />
				</div>
			</div >
		</>
	);
};
