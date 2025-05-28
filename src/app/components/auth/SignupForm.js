'use client'

import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import React, { useState } from "react";
import { app } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { simpleNotify } from "@/utils/common";
import { useLoader } from "@/context/LoaderContext";
import { useRouter } from 'next/navigation';

const auth = getAuth(app)

const saveUserData = async (userId, formData) => {
	const userDoc = doc(db, "users", userId);
	await setDoc(userDoc, formData);
};

const SignUpForm = () => {

	const [error, setError] = useState(null);
	const { loading, setLoading } = useLoader();
	const router = useRouter();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		setLoading(true);
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			simpleNotify("Passwords do not match!");
			return;
		}

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);
			const user = userCredential.user;
			console.log("user uid", user.uid)
			const userDatasav = await saveUserData(user.uid, { firstName: formData.firstName, lastName: formData.lastName });

			simpleNotify("User created successfully!")
			 router.push('/auth/login')
		} catch (error) {
			console.error("Error creating user:", error.message);
			setError(error.message)
		}finally{
			setLoading(false)
		}

		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		});
		
	};

	return (

		<div style={{
			opacity: loading ? 0.5 : 1,
			pointerEvents: loading ? 'none' : 'auto',
			transition: 'opacity 0.3s ease'
		}}>
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
				<h2>Sign Up</h2>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							name="firstName"
							placeholder="First Name"
							value={formData.firstName}
							onChange={handleChange}
							required
							style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
						/>
						<input
							type="text"
							name="lastName"
							placeholder="Last Name"
							value={formData.lastName}
							onChange={handleChange}
							required
							style={{ width: "100%", padding: "10px" }}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							required
							style={{ width: "100%", padding: "10px" }}
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
							style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
						/>
						<input
							type="password"
							name="confirmPassword"
							placeholder="Confirm Password"
							value={formData.confirmPassword}
							onChange={handleChange}
							required
							style={{ width: "100%", padding: "10px" }}
						/>
					</div>
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
						Sign Up
					</button>
				</form>
			</div>
		</div>

	);
};

export default SignUpForm;
