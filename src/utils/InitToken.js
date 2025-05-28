'use client'

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { setToken } from '@/redux/user/userSlice';
import { fetchUserData } from '@/redux/user/userActions';
import { fetchCart } from '@/redux/cart/cartAction';

export const InitToken = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get('token');
    const user_uid = localStorage.getItem("user_uid")

    if (token) {
      dispatch(setToken(token));
      dispatch(fetchCart(user_uid))
    }
  }, [dispatch]);

  return null;
};

