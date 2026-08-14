import userReducer from './user/userSlice';
import cartReducer from './cart/cartSlice';
import wishlistReducer from './wishlist/wishlistSlice';
import { createWrapper } from 'next-redux-wrapper';
import { configureStore } from '@reduxjs/toolkit';

export const store  = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

// for SSR: create new store every time
export const initializeStore = (preloadedState) => {
  return configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer,
      wishlist: wishlistReducer,
    },
    preloadedState,
  });
};