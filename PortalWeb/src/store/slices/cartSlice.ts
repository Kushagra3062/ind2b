import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

interface CartItem {
  id: string
  title: string
  image_link: string
  price: number
  quantity: number
  discount: number
  stock: number
  units?: string
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
  syncing: boolean
  initialized: boolean
  lastSyncedItems: any[]
  orderProcessing: boolean // Add this for order processing state
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  syncing: false,
  initialized: false,
  lastSyncedItems: [],
  orderProcessing: false,
}

// Async thunk to fetch product stock
export const fetchProductStock = createAsyncThunk("cart/fetchProductStock", async (productId: string) => {
  try {
    const response = await axios.get(`/api/products/stock?id=${productId}`)
    return response.data.stock
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product stock")
  }
})

// Async thunk for fetching cart
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/cart")
    return response.data.items || []
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch cart")
  }
})

// Async thunk for updating cart
export const updateCart = createAsyncThunk("cart/updateCart", async (items: any[], { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/cart", { items })
    return response.data.items
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update cart")
  }
})

// Async thunk to sync cart to database
export const syncCart = createAsyncThunk("cart/syncCart", async (items: CartItem[], { rejectWithValue, getState }) => {
  try {
    // Get the current state
    const state = getState() as { cart: CartState }

    // Check if items have changed since last sync
    if (JSON.stringify(items) === JSON.stringify(state.cart.lastSyncedItems)) {
      return items // No need to sync if items haven't changed
    }

    // Convert Redux cart items to database format
    const dbItems = items.map((item) => ({
      productId: item.id, // Map 'id' to 'productId' for the database
      title: item.title,
      image_link: item.image_link,
      price: Number(item.price),
      discount: Number(item.discount || 0),
      units: item.units,
      quantity: Number(item.quantity || 1),
      stock: Number(item.stock || 0),
    }))

    const response = await axios.post("/api/cart", { items: dbItems })
    if (response.data.items) {
      return response.data.items
    }
    return rejectWithValue(response.data.error || "Failed to sync cart")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to sync cart")
  }
})

// NEW: Async thunk to decrement cart quantities after order placement
export const decrementCartQuantities = createAsyncThunk(
  "cart/decrementCartQuantities",
  async (orderedItems: Array<{ productId: string; quantity: number }>, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/cart/decrement-quantities", { orderedItems })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to decrement cart quantities")
    }
  },
)

// Async thunk to add item to cart in database
export const addItemToDb = createAsyncThunk(
  "cart/addItemToDb",
  async (payload: { item: Omit<CartItem, "stock">; stock: number }, { rejectWithValue }) => {
    try {
      const { item, stock } = payload
      const dbItem = {
        productId: item.id, // Map 'id' to 'productId' for the database
        title: item.title,
        image_link: item.image_link,
        price: Number(item.price),
        discount: Number(item.discount || 0),
        units: item.units,
        quantity: Number(item.quantity || 1),
        stock: Number(stock),
      }

      const response = await axios.post("/api/cart/items", { ...dbItem })
      if (response.data.items) {
        return response.data.items
      }
      return rejectWithValue(response.data.error || "Failed to add item to cart")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add item to cart")
    }
  },
)

// Async thunk to remove item from cart in database
export const removeItemFromDb = createAsyncThunk("cart/removeItemFromDb", async (id: string, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`/api/cart/items?id=${id}`)
    if (response.data.items) {
      return response.data.items
    }
    return rejectWithValue(response.data.error || "Failed to remove item from cart")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to remove item from cart")
  }
})

// Async thunk to update item quantity in database
export const updateItemQuantityInDb = createAsyncThunk(
  "cart/updateItemQuantityInDb",
  async (payload: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const { id, quantity } = payload
      const response = await axios.put("/api/cart/items", {
        id,
        quantity: Number(quantity),
      })
      if (response.data.items) {
        return response.data.items
      }
      return rejectWithValue(response.data.error || "Failed to update item quantity")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update item quantity")
    }
  },
)

// Async thunk to clear cart in database
export const clearCartInDb = createAsyncThunk("cart/clearCartInDb", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.delete("/api/cart")
    if (response.data.message) {
      return true
    }
    return rejectWithValue(response.data.error || "Failed to clear cart")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to clear cart")
  }
})

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { item, stock } = action.payload
      const existingItem = state.items.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        // If item already exists, increase quantity (up to stock limit)
        if (existingItem.quantity < stock) {
          existingItem.quantity += 1
        }
      } else {
        // Add new item with quantity 1
        state.items.push({
          ...item,
          quantity: 1,
          stock,
        })
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity < item.stock) {
        item.quantity += 1
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity > 1) {
        item.quantity -= 1
      }
    },
    updateItemStock: (state, action) => {
      const { productId, stock } = action.payload
      const item = state.items.find((item) => item.id === productId)
      if (item) {
        item.stock = stock
      }
    },
    clearCart: (state) => {
      state.items = []
      state.loading = false
      state.error = null
    },
    setCartFromDb: (state, action: PayloadAction<any>) => {
      const dbCart = action.payload
      if (dbCart && Array.isArray(dbCart)) {
        // Convert database items to Redux format
        state.items = dbCart.map((item: any) => ({
          id: item.productId || item.id, // Map productId back to id for Redux
          title: item.title,
          image_link: item.image_link,
          price: Number(item.price),
          quantity: Number(item.quantity),
          discount: Number(item.discount || 0),
          stock: Number(item.stock || 0),
          units: item.units,
        }))
        // Update lastSyncedItems to match current items
        state.lastSyncedItems = JSON.parse(JSON.stringify(state.items))
      }
      state.initialized = true
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    // NEW: Local action to decrement quantities optimistically
    decrementQuantitiesLocally: (state, action: PayloadAction<Array<{ productId: string; quantity: number }>>) => {
      const orderedItems = action.payload

      orderedItems.forEach(({ productId, quantity }) => {
        const itemIndex = state.items.findIndex((item) => item.id === productId)

        if (itemIndex !== -1) {
          const item = state.items[itemIndex]
          const newQuantity = item.quantity - quantity

          if (newQuantity <= 0) {
            // Remove item if quantity becomes 0 or negative
            state.items.splice(itemIndex, 1)
          } else {
            // Update quantity
            item.quantity = newQuantity
          }
        }
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProductStock
      .addCase(fetchProductStock.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductStock.fulfilled, (state, action: PayloadAction<number, string, { arg: string }>) => {
        state.loading = false
        const productId = action.meta.arg // Access productId from meta
        const item = state.items.find((item) => item.id === productId)
        if (item) {
          item.stock = action.payload
        }
      })
      .addCase(fetchProductStock.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch product stock"
      })

      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        // Update lastSyncedItems to match current items
        state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload))
        state.initialized = true
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true // Mark as initialized even if there was an error
      })
      .addCase(updateCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        // Update lastSyncedItems to match current items
        state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload))
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // syncCart
      .addCase(syncCart.pending, (state) => {
        state.syncing = true
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.syncing = false
        if (action.payload) {
          state.items = action.payload
          // Update lastSyncedItems to match current items
          state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload))
        }
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.syncing = false
        state.error = (action.payload as string) || "Failed to sync cart"
      })

      // NEW: decrementCartQuantities
      .addCase(decrementCartQuantities.pending, (state) => {
        state.orderProcessing = true
        state.error = null
      })
      .addCase(decrementCartQuantities.fulfilled, (state, action) => {
        state.orderProcessing = false
        if (action.payload.success) {
          state.items = action.payload.updatedItems
          state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload.updatedItems))
        }
      })
      .addCase(decrementCartQuantities.rejected, (state, action) => {
        state.orderProcessing = false
        state.error = (action.payload as string) || "Failed to update cart after order"
      })

      // addItemToDb
      .addCase(addItemToDb.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          // Update lastSyncedItems to match current items
          state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload))
        }
      })

      // removeItemFromDb
      .addCase(removeItemFromDb.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          // Update lastSyncedItems to match current items
          state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload))
        }
      })

      // updateItemQuantityInDb
      .addCase(updateItemQuantityInDb.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
          // Update lastSyncedItems to match current items
          state.lastSyncedItems = JSON.parse(JSON.stringify(action.payload))
        }
      })

      // clearCartInDb
      .addCase(clearCartInDb.fulfilled, (state) => {
        state.items = []
        // Update lastSyncedItems to match current items
        state.lastSyncedItems = []
      })
  },
})

export const {
  addItem,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  updateItemStock,
  clearCart,
  setCartFromDb,
  setLoading,
  setError,
  decrementQuantitiesLocally,
} = cartSlice.actions

export default cartSlice.reducer
