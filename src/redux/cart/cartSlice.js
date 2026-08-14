import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCart,
  addToCart,
  addOrder,
  removeFromCart,
  updateCartItem,
  decrementQuantity,
  incrementQuantity,
  fetchUserOrders,
  cancelUserOrder,
  clearCart,
} from './cartAction';

const AVAILABLE_COUPONS = {
  SAVE10: { code: 'SAVE10', discountType: 'percentage', value: 10, minAmount: 0 },
  WELCOME20: { code: 'WELCOME20', discountType: 'percentage', value: 20, minAmount: 100 },
  FLAT50: { code: 'FLAT50', discountType: 'fixed', value: 50, minAmount: 200 },
  FREESHIP: { code: 'FREESHIP', discountType: 'shipping', value: 0, minAmount: 0 },
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  orderList: [],
  appliedCoupon: null,
  couponDiscount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    applyCouponCode: (state, action) => {
      const code = (action.payload || '').trim().toUpperCase();
      const coupon = AVAILABLE_COUPONS[code];

      if (!coupon) {
        state.error = 'Invalid coupon code. Try SAVE10, WELCOME20, or FLAT50.';
        return;
      }

      const subtotal = state.items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );

      if (subtotal < coupon.minAmount) {
        state.error = `Coupon requires a minimum order of ₹${coupon.minAmount}.`;
        return;
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
      } else if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.value, subtotal);
      } else if (coupon.discountType === 'shipping') {
        discount = 0; // handled at checkout shipping level
      }

      state.appliedCoupon = coupon;
      state.couponDiscount = discount;
      state.error = null;
    },
    removeCouponCode: (state) => {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
    resetCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Increment Quantity
      .addCase(incrementQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      // Decrement Quantity
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.appliedCoupon = null;
        state.couponDiscount = 0;
      })

      // Add Order
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.appliedCoupon = null;
        state.couponDiscount = 0;
        if (action.payload) {
          state.orderList = [action.payload, ...state.orderList];
        }
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel User Order
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        state.orderList = state.orderList.map((order) =>
          order.id === orderId ? { ...order, status } : order
        );
      });
  },
});

export const { applyCouponCode, removeCouponCode, resetCartError } = cartSlice.actions;
export default cartSlice.reducer;
