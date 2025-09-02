import { createSlice } from '@reduxjs/toolkit';
import { fetchUserData } from './userActions';
import { logoutUser, fetchProducts } from './userActions';
import { current } from '@reduxjs/toolkit';
import { act } from 'react';


const initialState = {
  token: null,
  userData: null,
  loading: false,
  error: null,
  products: [],
  allProducts: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    filterProducts: (state, action) => {
      if (action.payload === 'all') {
        state.products = state.allProducts;
      } else {
        const d = state.allProducts
        console.log(current(d), "888")
        state.products = state.allProducts.filter((i) => i.category.includes(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user data';
      })


      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.allProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

  },
});

export const { setToken, filterProducts, setUserData } = userSlice.actions;
export default userSlice.reducer;
