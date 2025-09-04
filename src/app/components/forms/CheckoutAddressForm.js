import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import '../../globals.css'
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 max-w-md mx-auto d-flex justify-content-center flex-column px-5">
            <div className='checkout-form-field'>
                <label>Full Name</label>
                <input {...register('fullName')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.fullName?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Email</label>
                <input {...register('email')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Phone Number</label>
                <input {...register('phone')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.phone?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Address</label>
                <textarea {...register('address')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.address?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>City</label>
                <input {...register('city')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.city?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>State</label>
                <input {...register('state')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.state?.message}</p>
            </div>

            <div className='checkout-form-field'>
                <label>Zip Code</label>
                <input {...register('zip')} className="w-full border px-2 py-1" />
                <p className="text-red-500 text-sm">{errors.zip?.message}</p>
            </div>


            <div style={{  alignSelf: 'center' }} className=" mt-3 d-flex gap-3">
                <button className="btn btn-secondary" onClick={handleRedirect}>
                    Cancel
                </button>
            </div>

            <button type="submit" style={{  alignSelf: 'center' }} className="mt-3 bg-blue-600 text-black px-4 py-2 rounded">
                Order Now
            </button>
        </form>
    );
}
