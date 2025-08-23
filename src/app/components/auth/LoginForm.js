'use client'

import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import React, { useState } from "react";
import Cookies from 'js-cookie';
import { app } from "@/firebase";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { simpleNotify } from "@/utils/common";
import { setToken } from "@/redux/user/userSlice";
import { useRouter } from 'next/navigation';
import { useLoader } from "@/context/LoaderContext";
import { fetchUserData } from "@/redux/user/userActions";


const auth = getAuth(app);

export const LoginForm = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { loading, setLoading } = useLoader();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [error, setError] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true)
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);
			const user = userCredential.user;
			const idToken = await user.getIdToken();
			console.log("User ID Token:", idToken);
			Cookies.set('token', idToken, {
				expires: 1,                    // 1 day
				path: '/',                    // root-level cookie
				sameSite: 'Strict',           // or 'Lax', but 'Strict' is safer
				secure: true,                 // MUST be true in production
			});
			dispatch(setToken(idToken))
			dispatch(fetchUserData())
			simpleNotify("Login Successfully!")
			setTimeout(() => {
			}, 3000)
			router.push("/")
		} catch (error) {
			setError("Invalid email or password");
			console.log("Error logging in:");
		}

		setFormData({
			email: "",
			password: "",
		});
		setLoading(false)

	};

	return (
		<div>
			{error && (
				<div
					className="error-container"
					style={{
						color: "red",
						textAlign: "center",
						padding: "10px",
						fontSize: "16px",
						wordWrap: "break-word",
					}}
				>
					{error}
				</div>
			)}
			<div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
				<h2>Login</h2>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							required
							style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={formData.password}
							onChange={handleChange}
							required
							style={{ width: "100%", padding: "10px" }}
						/>
					</div>
					<div>
						<button
							type="submit"
							style={{
								width: "100%",
								padding: "10px",
								backgroundColor: "#4CAF50",
								color: "white",
								border: "none",
								cursor: "pointer",
							}}
						>
							Login
						</button>
						<Link href="/auth/signup" >
							<button
								className="mt-3"
								style={{
									width: "100%",
									padding: "10px",
									backgroundColor: "#4CAF50",
									color: "white",
									border: "none",
									cursor: "pointer",
								}}
							>
								SignUp
							</button>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

