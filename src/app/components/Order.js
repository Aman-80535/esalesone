'use client';
import { addOrder } from '@/redux/cart/cartAction';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StripeCheckout from 'react-stripe-checkout';
import CheckoutAddressForm from './forms/CheckoutAddressForm';
import Loader from './common/Loader';
import { sendEmail } from '@/utils/sendEmail';
import { failedOrderSubject, failedOrdertext, successOrderSubject, successOrdertext } from '@/utils/common';



export default function ProductDetails() {
	const [showPopup, setShowPopup] = useState(false);
	const [checkoutFormData, setCheckoutFormData] = useState('');
	const { items, loading } = useSelector((s) => s.cart);
	const [orderInprocess, setOrderInprocess] = useState(false);
	const router = useRouter();
	const dispatch = useDispatch();
	const products = items || [];

	const grandTotal = products.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0)

	const handleOrderSubmit = async () => {
		createOrder();
	};

	async function sendOrderSuccessEmail(result) {
		const { email } = result;
		const subject = successOrderSubject(result)
		const html = successOrdertext(result);
		await sendEmail({ to: email, subject, html });
		return { success: true };

	}

	async function sendOrderFailedEmail(result) {
		const { email } = result;
		const subject = failedOrderSubject(result)
		const html = failedOrdertext(result);
		await sendEmail({ to: email, subject, html });
		return { success: true };
	}


	async function createOrder(token = {}) {
		setOrderInprocess(true);
		try {
			const result = await dispatch(addOrder({
				items,
				...token,
				...checkoutFormData,
				grandTotal,
				status: "pending"
			}));
			if (addOrder.fulfilled.match(result)) {
				setShowPopup(false);

				// try {
				// 	await sendOrderSuccessEmail(result.payload);
				// 	alert('confirmation email sent!')
				// } catch (emailError) {
				// 	console.log('❌ Email Error:', emailError);
				// 	// Optional: Notify user, but don't block order success
				// 	alert('⚠️ Order placed, but confirmation email failed to send.');
				// }

				router.push('/myorders');
			} else {
				// await sendOrderFailedEmail(result.payload);

				alert(result.payload || '❌ Failed to place order');
			}

		} catch (error) {
			//  This catch handles unexpected errors during order creation
			console.log('❌ Unexpected error during createOrder:', error);
			alert(error || 'Something went wrong while placing your order.');
			router.push('/myorders');

		}
		finally {
			setOrderInprocess(false)

		}
	}



	const handleToken = async (token, adresses) => {
		try {
			await createOrder({ token, payment: 'success' });
			alert('Payment successful and order placed!');
		} catch (error) {
			alert('Payment was successful, but something went wrong while placing the order.');
		}
	};

	if (loading || orderInprocess) {
		return <Loader />
	}

	return (
		<>
			{!loading && items?.length > 0 && (
				<div className="min-vh-100 bg-light p-3 p-md-5">
					<div className="container">
						<h2 className="text-center fw-bold mb-5">Checkout</h2>

						{/* Cart Products */}
						<div className="row g-4 justify-content-center">
							{products.map((product, idx) => (
								<div key={idx} className="col-12 col-md-10 col-lg-8">
									<div className="card shadow-sm border-0 rounded-3 h-100">
										<div className="row g-0">
											{/* Product Image */}
											<div className="col-12 col-md-4">
												<img
													src={product.image}
													alt={product.name}
													className="img-fluid rounded-start w-100 h-100"
													style={{ objectFit: "cover", minHeight: "200px" }}
												/>
											</div>

											{/* Product Details */}
											<div className="col-12 col-md-8">
												<div className="card-body d-flex flex-column justify-content-center">
													<h5 className="card-title fw-semibold">{product.name}</h5>
													<p className="mb-1">
														<strong>Type:</strong> {product.type}
													</p>
													<p className="mb-1">
														<strong>Price:</strong> ₹{product.price.toFixed(2)}
													</p>
													<p className="mb-1">
														<strong>Quantity:</strong> {product.quantity}
													</p>
													<p className="text-success fw-bold mt-2 mb-0">
														Subtotal: ₹{(product.price * product.quantity).toFixed(2)}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Grand Total */}
						<div className="text-center my-4">
							<h5 className="fw-bold mb-0">Grand Total:</h5>
							<h4 className="text-success fw-bold">₹{grandTotal.toFixed(2)}</h4>
						</div>

						{/* Address Input & Summary */}
						<div className="card shadow-lg border-0 rounded-3 p-4 mx-auto mb-5" style={{ maxWidth: "700px" }}>
							<h5 className="text-center mb-3 fw-semibold">Enter Details</h5>
							<CheckoutAddressForm
								setShowPopup={setShowPopup}
								setCheckoutFormData={setCheckoutFormData}
							/>
						</div>
					</div>

					{/* Confirmation Popup */}
					{showPopup && (
						<div className="modal d-block bg-dark bg-opacity-50">
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content rounded-3 shadow-lg border-0">
									<div className="modal-body text-center p-4">
										<p className="fs-5 fw-semibold mb-3">Confirm your order to:</p>
										<div className="bg-light border rounded p-3 mb-4 text-start">
											{checkoutFormData.address}
										</div>

										{/* Stripe Button */}
										<div className="mt-3 mb-4">
											<StripeCheckout
												stripeKey={process.env.NEXT_PUBLIC_STRIPE_CODE}
												token={handleToken}
												amount={grandTotal.toFixed(2) * 100}
												name="Shopi Cart"
												currency="INR"
											/>
										</div>

										{/* Action Buttons */}
										<div className="d-flex justify-content-center gap-3">
											<button
												className="btn btn-success px-4"
												onClick={handleOrderSubmit}
											>
												Cash On Delivery
											</button>
											<button
												className="btn btn-outline-danger px-4"
												onClick={() => setShowPopup(false)}
											>
												Cancel
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</>


	);
}
