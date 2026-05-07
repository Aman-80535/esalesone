import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import '../../globals.css'
import '../../styles/checkout.css'
import { useRouter } from 'next/navigation';

// Define schema using Zod
const schema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^[0-9+\-()\s]+$/, 'Invalid phone number format'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
});

export default function CheckoutAddressForm({ setShowPopup, setCheckoutFormData, grandTotal }) {
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [saveAddress, setSaveAddress] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });
    const router = useRouter();


    const onSubmit = (data) => {
        setCheckoutFormData(data);
        setShowPopup(true);
    };

    const handleRedirect = () => {
        router.push('/');
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-form checkout-full mt-4">
            <div className="checkout-header">
                <h3>Shipping Address</h3>
                <p className="muted">Enter the shipping details. We&apos;ll use this address to deliver your order.</p>
            </div>

            <div className="checkout-grid">
                <div className="checkout-left">
                    <div className='checkout-form-field row-2'>
                        <div>
                            <label>Full Name</label>
                            <input placeholder="John Doe" {...register('fullName')} className="input-field" />
                            <p className="error-text">{errors.fullName?.message}</p>
                        </div>

                        <div>
                            <label>Phone</label>
                            <input placeholder="1234567890" {...register('phone')} className="input-field" />
                            <p className="error-text">{errors.phone?.message}</p>
                        </div>
                    </div>

                    <div className='checkout-form-field'>
                        <label>Email</label>
                        <input placeholder="you@example.com" {...register('email')} className="input-field" />
                        <p className="error-text">{errors.email?.message}</p>
                    </div>

                    <div className='checkout-form-field'>
                        <label>Address</label>
                        <textarea placeholder="Street address, apt, suite, etc." {...register('address')} className="input-field" rows={3} />
                        <p className="error-text">{errors.address?.message}</p>
                    </div>

                    <div className='checkout-form-field row-2'>
                        <div>
                            <label>City</label>
                            <input {...register('city')} className="input-field" />
                            <p className="error-text">{errors.city?.message}</p>
                        </div>

                        <div>
                            <label>State / ZIP</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input {...register('state')} className="input-field" style={{ flex: 1 }} placeholder="State" />
                                <input {...register('zip')} className="input-field" style={{ width: '88px' }} placeholder="ZIP" />
                            </div>
                            <p className="error-text">{errors.state?.message || errors.zip?.message}</p>
                        </div>
                    </div>

                    <div className='checkout-form-field'>
                        <label>Shipping Method</label>
                        <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className="input-field">
                            <option value="standard">Standard — 3-5 days</option>
                            <option value="express">Express — 1-2 days</option>
                            <option value="pickup">Store Pickup</option>
                        </select>
                    </div>

                    <div className='checkout-form-field'>
                        <label>Payment Method</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
                            <option value="card">Card / UPI</option>
                            <option value="cod">Cash on Delivery</option>
                            <option value="netbanking">Netbanking</option>
                        </select>
                    </div>

                    <div className='checkout-form-field' style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input id="saveAddress" type="checkbox" checked={saveAddress} onChange={() => setSaveAddress(s => !s)} />
                        <label htmlFor="saveAddress">Save this address for faster checkout</label>
                    </div>
                </div>

                <aside className="checkout-summary">
                    <div className="summary-card">
                        <h4>Order Summary</h4>
                        <div className="summary-line"><span>Items</span><span>3</span></div>
                        <div className="summary-line"><span>Subtotal</span><span>${(grandTotal).toFixed(2)}</span></div>
                        <div className="summary-line"><span>Shipping</span><span>{shippingMethod === 'express' ? '$9.99' : shippingMethod === 'pickup' ? '$0.00' : '$4.99'}</span></div>
                        <div className="summary-line"><span>Discount</span><span>-$0.00</span></div>
                        <div className="summary-total"><span>Total</span><span>${(grandTotal + (shippingMethod === 'express' ? 9.99 : shippingMethod === 'pickup' ? 0 : 4.99)).toFixed(2)}</span></div>

                        <div style={{ marginTop: 12 }}>
                            <button type="button" className="btn-ghost" onClick={() => setShowPopup(false)} style={{ width: '100%' }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary-cta" style={{ width: '100%', marginTop: 10 }}>
                                Order Now
                            </button>
                        </div>
                    </div>
                    <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>We&apos;ll never share your details. Secure payment and easy returns.</p>
                </aside>
            </div>
        </form>
    );
}
