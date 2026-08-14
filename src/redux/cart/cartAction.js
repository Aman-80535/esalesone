import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  collection,
  query,
  where,
  deleteDoc,
  addDoc,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { errorNotify, getUserUID, simpleNotify, successNotify } from '@/utils/common';

// Helper to get safe UID
const getEffectiveUID = async () => {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  return await getUserUID();
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userUid, { rejectWithValue }) => {
    try {
      const uid = userUid || (await getEffectiveUID());
      if (!uid) {
        // Fallback to local storage for guests
        if (typeof window !== 'undefined') {
          const localCart = localStorage.getItem('guest_cart');
          return localCart ? JSON.parse(localCart) : [];
        }
        return [];
      }

      const cartRef = doc(db, 'carts', uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        return cartSnap.data().items || [];
      }
      return [];
    } catch (error) {
      console.error('fetchCart error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item, { rejectWithValue, dispatch }) => {
    try {
      const uid = await getEffectiveUID();
      const cartItemId = item.size ? `${item.id}-${item.size}` : item.id;
      const normalizedItem = {
        ...item,
        cartItemId,
        quantity: item.quantity || 1,
        size: item.size || 'M',
        price: Number(item.price || 0),
      };

      if (!uid) {
        // Save to guest localStorage
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_cart');
          let items = raw ? JSON.parse(raw) : [];
          const idx = items.findIndex((i) => (i.cartItemId || i.id) === cartItemId);
          if (idx > -1) {
            items[idx].quantity += normalizedItem.quantity;
          } else {
            items.push(normalizedItem);
          }
          localStorage.setItem('guest_cart', JSON.stringify(items));
          successNotify('Item added to cart!');
          return items;
        }
        return [normalizedItem];
      }

      const cartRef = doc(db, 'carts', uid);
      const cartSnap = await getDoc(cartRef);

      let updatedItems = [];
      if (cartSnap.exists()) {
        const existingItems = cartSnap.data().items || [];
        const idx = existingItems.findIndex(
          (cartItem) => (cartItem.cartItemId || cartItem.id) === cartItemId
        );

        if (idx > -1) {
          updatedItems = existingItems.map((cartItem, index) =>
            index === idx
              ? { ...cartItem, quantity: cartItem.quantity + (normalizedItem.quantity || 1) }
              : cartItem
          );
        } else {
          updatedItems = [...existingItems, normalizedItem];
        }
      } else {
        updatedItems = [normalizedItem];
      }

      await setDoc(cartRef, { items: updatedItems, updatedAt: serverTimestamp() }, { merge: true });
      successNotify('Item added to cart!');
      return updatedItems;
    } catch (error) {
      console.error('addToCart error:', error);
      errorNotify(error.message || 'Failed to add item to cart');
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();

      if (!uid) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_cart');
          let items = raw ? JSON.parse(raw) : [];
          items = items.filter((i) => (i.cartItemId || i.id) !== itemId && i.id !== itemId);
          localStorage.setItem('guest_cart', JSON.stringify(items));
          return items;
        }
        return [];
      }

      const cartRef = doc(db, 'carts', uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const currentItems = cartSnap.data().items || [];
        const updatedItems = currentItems.filter(
          (item) => (item.cartItemId || item.id) !== itemId && item.id !== itemId
        );

        await updateDoc(cartRef, { items: updatedItems });
        simpleNotify('Item removed from cart');
        return updatedItems;
      }
      return [];
    } catch (error) {
      console.error('removeFromCart error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const incrementQuantity = createAsyncThunk(
  'cart/incrementQuantity',
  async (itemId, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();

      if (!uid) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_cart');
          let items = raw ? JSON.parse(raw) : [];
          items = items.map((i) =>
            (i.cartItemId || i.id) === itemId || i.id === itemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
          localStorage.setItem('guest_cart', JSON.stringify(items));
          return items;
        }
        return [];
      }

      const cartRef = doc(db, 'carts', uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const items = cartSnap.data().items || [];
        const updatedItems = items.map((cartItem) =>
          (cartItem.cartItemId || cartItem.id) === itemId || cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );

        await setDoc(cartRef, { items: updatedItems }, { merge: true });
        return updatedItems;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const decrementQuantity = createAsyncThunk(
  'cart/decrementQuantity',
  async (itemId, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();

      if (!uid) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('guest_cart');
          let items = raw ? JSON.parse(raw) : [];
          items = items
            .map((i) =>
              (i.cartItemId || i.id) === itemId || i.id === itemId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
            .filter((i) => i.quantity > 0);
          localStorage.setItem('guest_cart', JSON.stringify(items));
          return items;
        }
        return [];
      }

      const cartRef = doc(db, 'carts', uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const items = cartSnap.data().items || [];
        const updatedItems = items
          .map((cartItem) =>
            (cartItem.cartItemId || cartItem.id) === itemId || cartItem.id === itemId
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);

        await setDoc(cartRef, { items: updatedItems }, { merge: true });
        return updatedItems;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();
      if (!uid) return [];

      const cartRef = doc(db, 'carts', uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const items = cartSnap.data().items || [];
        const updatedItems = items
          .map((i) =>
            (i.cartItemId || i.id) === itemId || i.id === itemId ? { ...i, quantity } : i
          )
          .filter((i) => i.quantity > 0);

        await setDoc(cartRef, { items: updatedItems }, { merge: true });
        return updatedItems;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const uid = await getEffectiveUID();
    if (uid) {
      const cartRef = doc(db, 'carts', uid);
      await setDoc(cartRef, { items: [] }, { merge: true });
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_cart');
    }
    return [];
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addOrder = createAsyncThunk(
  'orders/addOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();
      if (!uid) {
        errorNotify('Please login to complete your order.');
        return rejectWithValue('User not authenticated');
      }

      const now = Timestamp.now();
      const twentyFourHoursAgo = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
      const batchAssignments = [];
      const batchUpdates = [];

      for (const item of orderData.items || []) {
        const productId = item.id || 'item';
        const title = item.title || item.name || 'Product';
        const quantity = item.quantity || 1;
        const size = item.size || 'default';

        try {
          const batchQuery = query(
            collection(db, 'batches'),
            where('productId', '==', productId),
            where('created_at', '>=', twentyFourHoursAgo)
          );

          const batchSnap = await getDocs(batchQuery);
          let batchId = '';
          let batchDocRef;

          if (!batchSnap.empty) {
            const batchDoc = batchSnap.docs[0];
            batchId = batchDoc.id;
            batchDocRef = doc(db, 'batches', batchId);

            batchUpdates.push({ ref: batchDocRef, item });

            await updateDoc(batchDocRef, {
              total_quantity: (batchDoc.data().total_quantity || 0) + quantity,
              [`sizing_breakdown.${size}`]:
                (batchDoc.data().sizing_breakdown?.[size] || 0) + quantity,
            });
          } else {
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            batchId = `BATCH-${dateStr}-${productId}`;
            batchDocRef = doc(db, 'batches', batchId);

            await setDoc(batchDocRef, {
              batch_id: batchId,
              created_at: serverTimestamp(),
              productId,
              product_title: title,
              category: item.category || '',
              status: 'pending',
              order_ids: [],
              total_quantity: quantity,
              sizing_breakdown: { [size]: quantity },
            });

            batchUpdates.push({ ref: batchDocRef, item });
          }

          batchAssignments.push({
            ...item,
            batch_id: batchId,
          });
        } catch (bErr) {
          console.warn('Batch tracking warning (proceeding with order):', bErr);
          batchAssignments.push(item);
        }
      }

      // Save order to Firestore
      const ordersRef = collection(db, 'orders');
      const payloadToSave = {
        ...orderData,
        user_uid: uid,
        items: batchAssignments,
        status: orderData.status || 'pending',
        date: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(ordersRef, payloadToSave);

      // Update batches with order ID
      for (const { ref } of batchUpdates) {
        try {
          const batchSnap = await getDoc(ref);
          if (batchSnap.exists()) {
            const existingOrderIds = batchSnap.data().order_ids || [];
            await updateDoc(ref, {
              order_ids: Array.from(new Set([...existingOrderIds, docRef.id])),
            });
          }
        } catch (e) {
          console.warn('Batch update notice:', e);
        }
      }

      // Clear user's cart in Firestore & local
      try {
        const cartDocRef = doc(db, 'carts', uid);
        await setDoc(cartDocRef, { items: [] }, { merge: true });
      } catch (e) {}

      if (typeof window !== 'undefined') {
        localStorage.removeItem('guest_cart');
      }

      successNotify('Order placed successfully! 🎉');

      return {
        id: docRef.id,
        ...orderData,
        user_uid: uid,
        items: batchAssignments,
        status: orderData.status || 'pending',
        date: new Date().toISOString(),
      };
    } catch (error) {
      console.error('addOrder error:', error);
      errorNotify(error.message || 'Failed to place order');
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const uid = await getEffectiveUID();
      if (!uid) return [];

      const ordersRef = collection(db, 'orders');
      let orders = [];

      try {
        const q = query(ordersRef, where('user_uid', '==', uid), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        orders = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          date: d.data().date?.toDate ? d.data().date.toDate().toISOString() : d.data().date || d.data().createdAt || new Date().toISOString(),
        }));
      } catch (orderErr) {
        // Fallback without orderBy if index is building
        const qFallback = query(ordersRef, where('user_uid', '==', uid));
        const snapshot = await getDocs(qFallback);
        orders = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          date: d.data().date?.toDate ? d.data().date.toDate().toISOString() : d.data().date || d.data().createdAt || new Date().toISOString(),
        })).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      }

      return orders;
    } catch (error) {
      console.error('fetchUserOrders error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const cancelUserOrder = createAsyncThunk(
  'orders/cancelUserOrder',
  async ({ orderId, reason = 'Cancelled by user' }, { rejectWithValue }) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);

      if (!snap.exists()) {
        throw new Error('Order not found');
      }

      const orderData = snap.data();
      if (['delivered', 'shipped'].includes(orderData.status?.toLowerCase())) {
        throw new Error('Cannot cancel an order that has already been shipped or delivered.');
      }

      await updateDoc(orderRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
      });

      successNotify('Order has been cancelled successfully.');
      return { orderId, status: 'cancelled', cancellationReason: reason };
    } catch (error) {
      console.error('cancelUserOrder error:', error);
      errorNotify(error.message || 'Failed to cancel order');
      return rejectWithValue(error.message);
    }
  }
);