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


export const HomePage = () => {
	const { products: productsData, loading: Loading, error } = useSelector(s => s.user)
	const products = productsData;
	const [searchKey, setSearchKey] = useState("");
	const [filteredData, setFilteredData] = useState(products);
	const [Error, setError] = useState("");
	const dispatch = useDispatch();
	const { loading, setLoading } = useLoader();
	const router = useRouter()

	useEffect(() => {
		// if (typeof window !== 'undefined') {

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
		// }
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

	if (error) {
		return simpleNotify(error.message)
	}

	const handleClick = (id) => {
		router.push(`product/${id}`);
	};

	return (
		<>


			<div className="px-3 header-first flex items-center justify-center py-2">
				<Carousel />
			</div>
			<div className="hidden md:flex flex-1 justify-center mt-5">
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
					<div className=" mt-4">
						<div className="row" style={{ justifyContent: "center", gap:"80px" }}>
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
												<button className="add-cart-btn" onClick={(e) => handleAddToCart(e, product)}>Add to cart</button>
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
