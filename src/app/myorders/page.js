'use client'
import React from 'react'
import { initializeStore } from '@/redux/store';
import { fetchUserData } from '@/redux/user/userActions';
import { MyAccount } from '@/app/components/MyAccount';
import OrderHistory from '../components/MyOrders';

const myaccount = () => {
    return (
        <OrderHistory />
    )
}


export default myaccount