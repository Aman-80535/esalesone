import { createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { getUserUID, simpleNotify, successNotify } from '@/utils/common';

const getEffectiveUID = async () => {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  return await getUserUID();
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();
      if (!uid) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_wishlist');
          return raw ? JSON.parse(raw) : [];
        }
        return [];
      }

      const ref = doc(db, 'wishlists', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return [];
      return snap.data().items || [];
    } catch (error) {
      console.error('fetchWishlist error', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (item, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();

      if (!uid) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_wishlist');
          let items = raw ? JSON.parse(raw) : [];
          if (!items.find((i) => i.id === item.id)) {
            items.push(item);
            localStorage.setItem('guest_wishlist', JSON.stringify(items));
          }
          successNotify('Added to wishlist!');
          return items;
        }
        return [item];
      }

      const ref = doc(db, 'wishlists', uid);
      const snap = await getDoc(ref);
      let items = [];
      if (snap.exists()) {
        items = snap.data().items || [];
      }

      if (items.find((i) => i.id === item.id)) {
        simpleNotify('Item already in wishlist');
        return items;
      }

      const updated = [...items, item];
      await setDoc(ref, { items: updated }, { merge: true });
      successNotify('Added to wishlist! ❤️');
      return updated;
    } catch (error) {
      console.error('addToWishlist error', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (itemId, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();

      if (!uid) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_wishlist');
          let items = raw ? JSON.parse(raw) : [];
          items = items.filter((i) => i.id !== itemId);
          localStorage.setItem('guest_wishlist', JSON.stringify(items));
          simpleNotify('Removed from wishlist');
          return items;
        }
        return [];
      }

      const ref = doc(db, 'wishlists', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return [];

      const items = snap.data().items || [];
      const updated = items.filter((i) => i.id !== itemId);
      await setDoc(ref, { items: updated }, { merge: true });
      simpleNotify('Removed from wishlist');
      return updated;
    } catch (error) {
      console.error('removeFromWishlist error', error);
      return rejectWithValue(error.message);
    }
  }
);
