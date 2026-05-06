import React from 'react';
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

export default function CheckoutAddressForm({ setShowPopup, setCheckoutFormData }) {
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
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-form mt-4 max-w-md mx-auto px-4">
            <div className='checkout-form-field'>
                <label>Full Name</label>
                <input {...register('fullName')} className="input-field" />
                <p className="error-text">{errors.fullName?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Email</label>
                <input {...register('email')} className="input-field" />
                <p className="error-text">{errors.email?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Phone Number</label>
                <input {...register('phone')} className="input-field" />
                <p className="error-text">{errors.phone?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Address</label>
                <textarea {...register('address')} className="input-field" />
                <p className="error-text">{errors.address?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>City</label>
                <input {...register('city')} className="input-field" />
                <p className="error-text">{errors.city?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>State</label>
                <input {...register('state')} className="input-field" />
                <p className="error-text">{errors.state?.message}</p>
            </div>

            <div className="checkout-form-field">
                <div className="form-cta-row">
                    <button type="button" className="btn-ghost" onClick={() => setShowPopup(false)}>
                        Cancel
                    </button>

                    <button type="submit" className="btn-primary-cta">
                        Order Now
                    </button>
                </div>
            </div>
        </form>
    );
}
