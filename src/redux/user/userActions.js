import { createAsyncThunk } from '@reduxjs/toolkit';
import { db, app } from '../../firebase';
import { doc, getDoc, setDoc, arrayRemove, arrayUnion, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from "firebase/auth";
import { simpleNotify, waitForUser } from '@/utils/common';
import Cookies from 'js-cookie';





export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {

    const user = await waitForUser(); 

    if (!user) {
      return rejectWithValue('No user is logged in');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return  data
      } else {
        throw new Error('No user data found');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const logoutUser = createAsyncThunk(
  'logoutUser',
  async (_, { rejectWithValue }) => {
    const auth = getAuth();
    try {
      Cookies.remove('token');
      localStorage.removeItem('user_uid')
      await signOut(auth);
      simpleNotify("Log out successfully!")
      return; 
    } catch (error) {
      return rejectWithValue(error.message); 
    }
  }
);


export const fetchProducts = createAsyncThunk(
  "/products",
  async (userId, thunkAPI) => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products data");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


