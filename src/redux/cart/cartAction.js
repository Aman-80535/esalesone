import { createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc, arrayRemove, orderBy, serverTimestamp, arrayUnion, updateDoc, collection, query, where, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { errorNotify, getUserUID, simpleNotify, waitForUser } from '@/utils/common';
import { app } from '@/firebase';
import { db } from '@/firebase';
import { date } from 'zod';

const auth = getAuth(app);
const user_uid = getUserUID();

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (item, { rejectWithValue }) => {
    console.log("aded tocart")
    try {
      const user = auth.currentUser;
      if (!user || !user_uid) {
        simpleNotify("Please Login First to add item in cart");
        return rejectWithValue("User not logged in");
      }
      const cartRef = doc(db, "carts", user.uid || user_uid);
      console.log("00000000", user.uid)

      // Fetch the current cart
      const cartSnap = await getDoc(cartRef);

      let updatedItems = [];

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const existingItems = cartData.items || [];

        // Check if the item already exists
        const itemIndex = existingItems.findIndex(
          (cartItem) => cartItem.id === item.id
        );

        if (itemIndex > -1) {
          // If item exists, update its quantity
          updatedItems = existingItems.map((cartItem, index) =>
            index === itemIndex
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          // If item doesn't exist, add it with quantity 1
          updatedItems = [...existingItems, { ...item, quantity: 1 }];
        }
      } else {
        // If no cart exists, create a new one with the item
        updatedItems = [{ ...item, quantity: 1 }];
      }

      // Update Firestore with the new cart items
      await setDoc(
        cartRef,
        {
          items: updatedItems,
        },
        { merge: true }
      );
      // simpleNotify("Product added");
      return updatedItems; // Return the updated items
    } catch (error) {
      simpleNotify(error.message)
      return rejectWithValue(error.message);
    }
  }
);

export const addOrder = createAsyncThunk(
  'orders/addOrder',
  async (orderData, thunkAPI) => {
    try {
      const user = auth.currentUser;
      const userid = user?.uid || user_uid; // Fallback to localStorage

      if (!userid) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      // Add order to Firestore
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, { ...orderData, user_uid: userid, date: serverTimestamp() });

      // Delete cart items for this user
      const cartDocRef = doc(db, 'carts', userid);
      await deleteDoc(cartDocRef);
      const savedDoc = await getDoc(docRef);

      alert(`Order placed to:\n${orderData?.address}`);
      return { id: docRef.id, ...savedDoc.data(), date: savedDoc.data().date.toDate().toISOString() };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  });

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, thunkAPI) => {
    const user_uid = await getUserUID();
    try {
      const ordersRef = collection(db, 'orders');
      const user = auth.currentUser;
      const userid = user?.uid || user_uid;
      if (!userid) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      const q = query(
        ordersRef,
        where('user_uid', '==', userid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString() || null
      }));
      return orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


// Async Thunk to Fetch Cart Items
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (user_uid, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user || !user_uid) throw new Error("User not authenticated");

      const cartRef = doc(db, "carts", user.uid || user_uid);
      const cartSnap = await getDoc(cartRef);
      console.log("before", cartSnap.data().items);
      if (cartSnap.exists()) {
        console.log("ewdwea", cartSnap.data())
        return cartSnap.data().items;
      } else {
        return [];
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk to Remove an Item from the Cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const user = await waitForUser();
      if (!user) throw new Error("User not authenticated");

      const cartRef = doc(db, "carts", user.uid || user_uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const updatedItems = cartData.items.filter((item) => item.id !== itemId); // Remove item by ID

        // Update Firestore with the filtered items
        await updateDoc(cartRef, {
          items: updatedItems,
        });

        return updatedItems; // Return the updated cart items
      } else {
        throw new Error("Cart not found");
      }
    } catch (error) {
      console.log(error, "error in remove from cart")
      return rejectWithValue(error.message);
    }
  }
);



// Async Thunk to Update Cart Item Quantity
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, newQuantity }, { rejectWithValue }) => {
    try {
      const user = await waitForUser();
      if (!user) throw new Error("User not authenticated");

      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const updatedItems = cartData.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );

        await updateDoc(cartRef, {
          items: updatedItems,
        });

        return updatedItems;
      }
      throw new Error("Cart not found");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const decrementQuantity = createAsyncThunk(
  "cart/decrementQuantity",
  async (itemId, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const cartRef = doc(db, "carts", user.uid || user_uid);
      const cartSnap = await getDoc(cartRef);
      console.log("cwefiwe", cartSnap === true)
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const updatedItems = cartData.items
          .map((cartItem) =>
            cartItem.id === itemId
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0); // Remove items with 0 quantity

        // Update Firestore
        await setDoc(cartRef, { items: updatedItems }, { merge: true });

        return updatedItems;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const incrementQuantity = createAsyncThunk(
  "cart/incrementQuantity",
  async (itemId, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user || !user_uid) throw new Error("User not authenticated");
      const cartRef = doc(db, "carts", user.uid || user_uid);
      const cartSnap = await getDoc(cartRef);
      console.log("cwefiwe", cartSnap === true)
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const updatedItems = cartData.items
          .map((cartItem) =>
            cartItem.id === itemId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0); // Remove items with 0 quantity

        // Update Firestore
        await setDoc(cartRef, { items: updatedItems }, { merge: true });

        return updatedItems;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);