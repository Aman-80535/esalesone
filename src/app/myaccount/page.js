import React from 'react'
import { initializeStore } from '@/redux/store';
import { fetchUserData } from '@/redux/user/userActions';
import { MyAccount } from '@/app/components/MyAccount';

const myaccount = () => {
    return (
        <MyAccount />
    )
}


export default myaccount