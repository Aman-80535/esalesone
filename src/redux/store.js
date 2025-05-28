import userReducer from './user/userSlice';
import cartReducer from './cart/cartSlice';
import { createWrapper } from 'next-redux-wrapper';
import { configureStore } from '@reduxjs/toolkit';

export const store  = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer
  },
});

// for SSR: create new store every time
export const initializeStore = (preloadedState) => {
  return configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer
    },
    preloadedState,
  });
};