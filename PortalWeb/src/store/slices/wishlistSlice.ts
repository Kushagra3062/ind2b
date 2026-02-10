import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

// Define the type for wishlist items
interface WishlistItem {
  id: string
  title: string
  image_link: string
  price: number
  discount?: number
  seller_id?: number | string
  units?: string
  stock?: number
}

// Define the wishlist state structure
interface WishlistState {
  items: WishlistItem[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

// Initial state for the wishlist
const initialState: WishlistState = {
  items: [],
  status: "idle",
  error: null,
}

// Async thunk for fetching the wishlist
export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/wishlist")
    if (response.data.success) {
      // Map the items to match our Redux structure
      const items =
        response.data.wishlist?.items?.map((item: any) => ({
          id: item.productId,
          title: item.title,
          image_link: item.image_link,
          price: item.price,
          discount: item.discount,
          seller_id: item.seller_id,
          units: item.units,
          stock: item.stock,
        })) || []
      return items
    } else {
      return rejectWithValue(response.data.error || "Failed to fetch wishlist")
    }
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message)
    }
    return rejectWithValue("An unknown error occurred")
  }
})

// Async thunk for adding an item to the wishlist
export const addWishlistItem = createAsyncThunk(
  "wishlist/addWishlistItem",
  async (item: WishlistItem, { rejectWithValue, getState }) => {
    try {
      // Check if item already exists in the state
      const state = getState() as { wishlist: WishlistState }
      const existingItem = state.wishlist.items.find((i) => i.id === item.id)

      if (existingItem) {
        // Item already exists, return it without making an API call
        return existingItem
      }

      // Map the item to match the API structure
      const apiItem = {
        productId: item.id,
        title: item.title,
        image_link: item.image_link,
        price: item.price,
        discount: item.discount,
        seller_id: item.seller_id,
        units: item.units,
        stock: item.stock,
      }

      const response = await axios.post("/api/wishlist/items", { item: apiItem })
      if (response.data.success) {
        return item
      } else {
        return rejectWithValue(response.data.error || "Failed to add item to wishlist")
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue("An unknown error occurred")
    }
  },
)

// Async thunk for removing an item from the wishlist
export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/wishlist/items?productId=${productId}`)
      if (response.data.success) {
        return productId
      } else {
        return rejectWithValue(response.data.error || "Failed to remove item from wishlist")
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue("An unknown error occurred")
    }
  },
)

// Create the wishlist slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Add an item to the wishlist (local only)
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      // Check if the item already exists in the wishlist
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id)

      // Only add the item if it doesn't already exist in the wishlist
      if (existingItemIndex === -1) {
        state.items.push(action.payload)
      }
    },

    // Remove an item from the wishlist (local only)
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      // Filter out the item with the matching id
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    // Clear all items from the wishlist (local only)
    clearWishlist: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })

      // Add wishlist item
      .addCase(addWishlistItem.pending, (state) => {
        state.status = "loading"
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.status = "succeeded"
        // Check if the item already exists
        const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id)
        if (existingItemIndex === -1) {
          state.items.push(action.payload)
        }
        state.error = null
      })
      .addCase(addWishlistItem.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })

      // Remove wishlist item
      .addCase(removeWishlistItem.pending, (state) => {
        state.status = "loading"
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.error = null
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

// Export the actions and reducer
export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
