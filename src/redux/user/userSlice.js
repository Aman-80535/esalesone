import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUserData,
  logoutUser,
  fetchProducts,
  updateUserProfile,
  saveUserAddress,
  deleteUserAddress,
  fetchAllAdminOrders,
  updateOrderStatusAdmin,
  fetchAllAdminUsers,
} from './userActions';

const initialState = {
  token: null,
  userData: null,
  loading: false,
  error: null,
  products: [],
  allProducts: [],
  adminOrders: [],
  adminUsers: [],
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
      const category = (action.payload || 'all').toLowerCase();
      if (category === 'all') {
        state.products = state.allProducts;
      } else {
        state.products = state.allProducts.filter((i) => {
          const itemCat = String(i?.category?.name ?? i?.category ?? '').toLowerCase();
          return itemCat.includes(category);
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Data
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

      // Update User Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userData = {
          ...(state.userData || {}),
          ...action.payload,
        };
      })

      // Address actions
      .addCase(saveUserAddress.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.addresses = action.payload;
        }
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.addresses = action.payload;
        }
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.userData = null;
        state.token = null;
      })

      // Fetch Products
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
        state.error = action.payload || action.error.message;
      })

      // Admin Orders
      .addCase(fetchAllAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        state.adminOrders = state.adminOrders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        );
      })

      // Admin Users
      .addCase(fetchAllAdminUsers.fulfilled, (state, action) => {
        state.adminUsers = action.payload;
      });
  },
});

export const { setToken, filterProducts, setUserData } = userSlice.actions;
export default userSlice.reducer;
