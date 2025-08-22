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


export const HomePage = ({ data = [] }) => {
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
			<div>
				<SocialPage />
			</div>
			<div className="px-3 header-first flex items-center justify-center py-2">
				<Carousel />
			</div>
			<div className="main-container py-2 px-3 mt-3">
				<div className="internal-container px-4">
					<div style={{ textAlign: "center", width: "100%" }}>
						<input
							className="text-center"
							placeholder="Search a Product"
							style={{
								textAlignLast: "center",
								height: "3rem",
								width: "32%",
								border: "1px solid",
								borderRadius: "56px",
							}}
							value={searchKey}
							onChange={(event) => handleSearch(event.target.value)}
						/>
					</div>
					<div className=" mt-4">
						<div className="row">
							{(filteredData).map((product) => (
								<div className="col-lg-3 col-md-4 col-sm-6 col-6 mb-4" key={product.id} onClick={() => handleClick(product.id)} >
									<div className="card" style={{ height: "100%" }}>
										<img
											src={product.image}
											alt={product.name}
											className="card-img-top"
											style={{ height: "200px", objectFit: "cover" }}
										/>
										<span
											style={{
												position: "absolute",
												top: "10px",
												right: "10px",
												backgroundColor: "rgba(0, 0, 0, 0.6)",
												color: "white",
												borderRadius: "50%",
												padding: "5px 10px",
												fontSize: "18px",
												cursor: "pointer",
											}}
											onClick={(e) => handleAddToCart(e, product)}
										>
											+
										</span>
										<div className="card-body">
											<p className="card-text">{product.category?.name}</p>
											<h5 className="card-title">{product.name}</h5>
											<p className="card-text">{product.title}</p>
											<p className="card-text">Price: ${product.price}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

			</div >
		</>
	);
};
