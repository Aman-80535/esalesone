'use client';

import { createContext, useEffect, useState, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/firebase'; // your Firebase setup
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setToken } from '@/redux/user/userSlice';
import { fetchCart } from '@/redux/cart/cartAction';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const token = firebaseUser.accessToken;

        setUser(firebaseUser);
        Cookies.set('token', token);
        localStorage.setItem('user_uid', uid);

        dispatch(setToken(token));
        dispatch(fetchCart(uid));
      } else {
        setUser(null);
        Cookies.remove('token');
        localStorage.removeItem('user_uid');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
