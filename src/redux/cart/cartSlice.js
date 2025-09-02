import { createSlice, current } from '@reduxjs/toolkit';
import { fetchCart, addToCart, addOrder, removeFromCart, updateCartItem, decrementQuantity, incrementQuantity, fetchUserOrders } from './cartAction';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    orderList: []
  },
  reducers: {
    chekItem: (state, action) => {
      console.log("checked item");
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {

        state.loading = false;
        state.orderList = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(addToCart.pending, (state, action) => {
        state.loading = true;

        const incomingItem = action.meta.arg;
        const existingItemIndex = state.items.findIndex(i => i.id === incomingItem.id);

        if (existingItemIndex > -1) {
          state.items[existingItemIndex].quantity += 1;
        } else {
          state.items.push({ ...incomingItem, quantity: 1 });
        }
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;

        const failedItem = action.meta.arg;
        const index = state.items.findIndex(item => item.id === failedItem.id);

        if (index > -1) {
          const currentItem = state.items[index];
          if (currentItem.quantity > 1) {
            state.items[index].quantity -= 1;
          } else {
            state.items.splice(index, 1);
          }
        }

        state.error = action.payload;
      })



      // Remove Item from Cart with Optimistic Update
      .addCase(removeFromCart.pending, (state, action) => {
        state.loading = true;

        // Optimistically remove the item from the UI
        state.items = state.items.filter(item => item.id !== action.meta.arg);

      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.items.push(action.meta.arg);
        state.error = action.payload;
      })

      // Update Item Quantity in Cart with Optimistic Update
      .addCase(updateCartItem.pending, (state, action) => {
        state.loading = true;

        // Optimistically update the item quantity
        const itemIndex = state.items.findIndex((i) => i.id === action.meta.arg.id);
        if (itemIndex >= 0) {
          state.items[itemIndex] = { ...state.items[itemIndex], quantity: action.meta.arg.quantity };
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        // Rollback the optimistic update in case of failure
        const itemIndex = state.items.findIndex((i) => i.id === action.meta.arg.id);
        if (itemIndex >= 0) {
          state.items[itemIndex] = { ...state.items[itemIndex], quantity: action.meta.arg.previousQuantity };
        }
        state.error = action.payload;
      })

      // Increment Item Quantity in Cart with Optimistic Update
      .addCase(incrementQuantity.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        // Optimistically increment the item quantity
        const itemIndex = state.items.findIndex((i) => i.id === action.meta.arg.id);
        if (itemIndex >= 0) {
          state.items[itemIndex] = {
            ...state.items[itemIndex],
            quantity: state.items[itemIndex].quantity + 1
          };
        }
      })
      .addCase(incrementQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(incrementQuantity.rejected, (state, action) => {
        state.loading = false;
        const itemIndex = state.items.findIndex((i) => i.id === action.meta.arg.id);
        if (itemIndex >= 0) {
          state.items[itemIndex] = {
            ...state.items[itemIndex],
            quantity: state.items[itemIndex].quantity - 1
          }; // Undo the increment
        }
        state.error = action.error.message;
      })

      // Decrement Item Quantity in Cart with Optimistic Update
      .addCase(decrementQuantity.pending, (state, action) => {
        state.loading = true;

        // Optimistically decrement the item quantity
        const itemIndex = state.items.findIndex((i) => i.id === action.meta.arg.id);
        if (itemIndex >= 0 && state.items[itemIndex].quantity > 1) {
          state.items[itemIndex] = {
            ...state.items[itemIndex],
            quantity: state.items[itemIndex].quantity - 1
          };
        }
      })
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.loading = false;
        const itemIndex = state.items.findIndex((i) => i.id === action.meta.arg.id);
        if (itemIndex >= 0) {
          state.items[itemIndex] = {
            ...state.items[itemIndex],
            quantity: state.items[itemIndex].quantity + 1
          }; // Undo the decrement
        }
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
export const { chekItem } = cartSlice.actions;
