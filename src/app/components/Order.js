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
		try {
			const result = await dispatch(addOrder({
				items,
				...token,
				...checkoutFormData,
				grandTotal
			}));
			if (addOrder.fulfilled.match(result)) {
				setShowPopup(false);

				try {
					await sendOrderSuccessEmail(result.payload);
					alert('confirmation email sent!')
				} catch (emailError) {
					console.log('❌ Email Error:', emailError);
					// Optional: Notify user, but don't block order success
					alert('⚠️ Order placed, but confirmation email failed to send.');
				}

				router.push('/myorders');
			} else {
				await sendOrderFailedEmail(result.payload);

				alert(result.payload || '❌ Failed to place order');
			}

		} catch (error) {
			//  This catch handles unexpected errors during order creation
			console.log('❌ Unexpected error during createOrder:', error);
			alert(error || 'Something went wrong while placing your order.');
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

	if (loading) {
		return <Loader />
	}

	return (
		<>
			{(!loading && items?.length > 0) &&
				<div className="min-vh-100 bg-light p-4">
					<div className="container">
						<h2 className="text-center mb-4">Checkout</h2>

						{products.map((product, idx) => (
							<div
								key={idx}
								className="card shadow-sm mb-4"
								style={{ maxWidth: '700px', margin: '0 auto' }}
							>
								<div className="row g-0">
									<div className="col-md-4">
										<img
											src={product.image}
											alt={product.name}
											className="img-fluid rounded-start object-fit-cover"
											style={{ height: '100%', objectFit: 'cover' }}
										/>
									</div>
									<div className="col-md-8">
										<div className="card-body">
											<h5 className="card-title">{product.name}</h5>
											<p className="card-text"><strong>Type:</strong> {product.type}</p>
											<p className="card-text"><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
											<p className="card-text"><strong>Quantity:</strong> {product.quantity}</p>
											<p className="card-text text-success fw-bold">
												Subtotal: ₹{(product.price * product.quantity).toFixed(2)}
											</p>
										</div>
									</div>
								</div>
							</div>
						))}

						<div className="d-flex align-items-center mb-3" style={{ placeSelf: 'center' }}>
							<h5 className="fw-bold mb-0">Grand Total:</h5>
							<h5 className="text-success mb-0 ml-2" style={{ marginLeft: '21px' }}>₹{grandTotal.toFixed(2)}</h5>
						</div>

						{/* Address Input & Summary */}
						<div className="card shadow-lg p-4" style={{ maxWidth: '700px', margin: '0 auto' }}>
							<div className="mb-3">
								<h5 className='justify-content-center'>Enter Details</h5>
								<CheckoutAddressForm setShowPopup={setShowPopup} setCheckoutFormData={setCheckoutFormData} />
							</div>
						</div>
					</div>

					{/* Confirmation Popup */}
					{showPopup && (
						<div className="modal d-block bg-dark bg-opacity-50">
							<div className="modal-dialog modal-dialog-centered">
								<div className="modal-content text-center">
									<div className="modal-body">
										<p className="fs-5 mb-3">Confirm your order to:</p>
										<div className="bg-light border p-3 mb-4 text-start rounded">
											{checkoutFormData.address}
										</div>

										<div className='mt-4 mb-2'>
											<StripeCheckout
												stripeKey={process.env.NEXT_PUBLIC_STRIPE_CODE}
												token={handleToken}
												amount={grandTotal.toFixed(2) * 100}
												name="Shopi Cart"
												currency="INR"
											/>
										</div>

										<div className="d-flex justify-content-center gap-3">
											<button className="btn btn-success" onClick={handleOrderSubmit}>
												Pay Later
											</button>
											<button
												className="btn btn-danger"
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

			}
		</>
	);
}
