import { createAsyncThunk } from '@reduxjs/toolkit';
import { db, auth } from '@/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  getDocs,
  collection,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { errorNotify, simpleNotify, successNotify, waitForUser } from '@/utils/common';
import Cookies from 'js-cookie';

export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const user = await waitForUser();
      if (!user) {
        return null;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          email: user.email,
          uid: user.uid,
          role: data.role || (data.isAdmin ? 'admin' : 'user'),
          addresses: data.addresses || [],
        };
      } else {
        // Create initial user doc if missing
        const initialData = {
          email: user.email,
          uid: user.uid,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          role: 'user',
          addresses: [],
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, initialData);
        return initialData;
      }
    } catch (error) {
      console.error('fetchUserData error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const user = await waitForUser();
      if (!user) throw new Error('No user is logged in');

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...profileData, updatedAt: serverTimestamp() }, { merge: true });

      successNotify('Profile updated successfully!');
      return profileData;
    } catch (error) {
      console.error('updateUserProfile error:', error);
      errorNotify(error.message || 'Failed to update profile');
      return rejectWithValue(error.message);
    }
  }
);

export const saveUserAddress = createAsyncThunk(
  'user/saveUserAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const user = await waitForUser();
      if (!user) throw new Error('No user is logged in');

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      const currentAddresses = snap.exists() ? snap.data().addresses || [] : [];

      const newAddress = {
        id: addressData.id || `addr_${Date.now()}`,
        ...addressData,
        createdAt: new Date().toISOString(),
      };

      const updated = addressData.id
        ? currentAddresses.map((a) => (a.id === addressData.id ? newAddress : a))
        : [...currentAddresses, newAddress];

      await setDoc(userDocRef, { addresses: updated }, { merge: true });
      successNotify('Address saved!');
      return updated;
    } catch (error) {
      errorNotify(error.message || 'Failed to save address');
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  'user/deleteUserAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const user = await waitForUser();
      if (!user) throw new Error('No user is logged in');

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      const currentAddresses = snap.exists() ? snap.data().addresses || [] : [];

      const updated = currentAddresses.filter((a) => a.id !== addressId);
      await setDoc(userDocRef, { addresses: updated }, { merge: true });
      successNotify('Address removed');
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk('logoutUser', async (_, { rejectWithValue }) => {
  try {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_uid');
    }
    await signOut(auth);
    simpleNotify('Logged out successfully');
    return null;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProducts = createAsyncThunk(
  'user/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return data;
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      return rejectWithValue(error.message || 'Failed to load products');
    }
  }
);

// Admin Specific Actions
export const fetchAllAdminOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        date: d.data().date?.toDate ? d.data().date.toDate().toISOString() : d.data().date || d.data().createdAt || new Date().toISOString(),
      })).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      return orders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatusAdmin = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      successNotify(`Order status updated to ${status}`);
      return { orderId, status };
    } catch (error) {
      errorNotify(error.message || 'Failed to update order status');
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllAdminUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      return users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
