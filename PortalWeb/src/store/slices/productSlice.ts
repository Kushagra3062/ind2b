import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

// Define the Product interface
export interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: object
  image_link: string
  stock: number
  price: number
  final_price?: number // Added final_price field to Product interface
  discount: number
  SKU: string
  seller_id: number
  created_at?: string
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

// Define cache entry interface
interface CacheEntry {
  data: any
  timestamp: number
}

// Define the state structure
interface ProductState {
  products: Product[]
  categorySubcategoryProducts: Record<string, Record<string, Product[]>>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: number | null
  cache: Record<string, CacheEntry> // Changed from Map to plain object
}

// Initial state
const initialState: ProductState = {
  products: [],
  categorySubcategoryProducts: {},
  status: "idle",
  error: null,
  lastFetched: null,
  cache: {}, // Changed from new Map() to {}
}

// Fetch ALL products without any limit (like the original implementation)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (options: { category?: string } = {}, { getState, rejectWithValue }) => {
    const state = getState() as { products: ProductState }

    const twentyMinutesInMs = 20 * 60 * 1000
    if (
      state.products.products.length > 0 &&
      state.products.lastFetched &&
      Date.now() - state.products.lastFetched < twentyMinutesInMs
    ) {
      return {
        products: state.products.products,
        categorySubcategoryProducts: state.products.categorySubcategoryProducts,
        fromCache: true,
      }
    }

    try {
      // Build URL without any limit - fetch ALL products
      let url = "/api/products"
      if (options.category) {
        url += `?category=${encodeURIComponent(options.category)}`
      }

      console.log("Fetching ALL products from:", url)

      const response = await axios.get(url)

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format from API")
      }

      const products: Product[] = response.data

      // Add fallback values for missing fields
      const processedProducts = products.map((product) => {
        const price = product.price || 0
        const discount = product.discount || 0
        const originalPrice = discount > 0 ? price / (1 - discount / 100) : price

        return {
          ...product,
          seller_name: product.seller_name || "Unknown Seller",
          location: product.location || "Unknown Location",
          rating: product.rating || 0,
          discount: product.discount || 0,
          image_link: product.image_link || "/placeholder.svg?height=200&width=200",
          price: price,
          final_price: product.final_price || 0, // Added final_price to processed products
          originalPrice: Number(originalPrice.toFixed(0)),
        }
      })

      // Group products by category and subcategory
      const groupedProducts: Record<string, Record<string, Product[]>> = {}

      processedProducts.forEach((product) => {
        const category = product.category_name || "Uncategorized"
        const subcategory = product.sub_category_name || "Uncategorized"

        if (!groupedProducts[category]) {
          groupedProducts[category] = {}
        }

        if (!groupedProducts[category][subcategory]) {
          groupedProducts[category][subcategory] = []
        }

        groupedProducts[category][subcategory].push(product)
      })

      console.log(
        `Processed ${processedProducts.length} products into ${Object.keys(groupedProducts).length} categories`,
      )

      return {
        products: processedProducts,
        categorySubcategoryProducts: groupedProducts,
        fromCache: false,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("Error fetching products:", errorMessage)
      return rejectWithValue(`Failed to load products: ${errorMessage}`)
    }
  },
)

// Fetch products by category (for lazy loading)
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchProductsByCategory",
  async (category: string, { getState, rejectWithValue }) => {
    const state = getState() as { products: ProductState }
    const cacheKey = `category_${category}`
    const cached = state.products.cache[cacheKey] // Changed from .get() to bracket notation

    // Check cache (5 minutes)
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return { category, products: cached.data }
    }

    try {
      const response = await axios.get(`/api/products?category=${encodeURIComponent(category)}`)

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      const products: Product[] = response.data || []
      return { category, products }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return rejectWithValue(`Failed to load products for ${category}: ${errorMessage}`)
    }
  },
)

// Create the slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.products = []
      state.categorySubcategoryProducts = {}
      state.status = "idle"
      state.lastFetched = null
      state.cache = {} // Changed from .clear() to {}
    },
    updateCache: (state, action: PayloadAction<{ key: string; data: any }>) => {
      // Changed from .set() to bracket notation
      state.cache[action.payload.key] = {
        data: action.payload.data,
        timestamp: Date.now(),
      }
    },
    clearCache: (state) => {
      state.cache = {} // Changed from .clear() to {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(
        fetchProducts.fulfilled,
        (
          state,
          action: PayloadAction<{
            products: Product[]
            categorySubcategoryProducts: Record<string, Record<string, Product[]>>
            fromCache?: boolean
          }>,
        ) => {
          state.status = "succeeded"

          state.products = action.payload.products
          state.categorySubcategoryProducts = action.payload.categorySubcategoryProducts

          if (!action.payload.fromCache) {
            state.lastFetched = Date.now()
          }

          state.error = null
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const { category, products } = action.payload

        // Update cache for this category - Changed from .set() to bracket notation
        const cacheKey = `category_${category}`
        state.cache[cacheKey] = {
          data: products,
          timestamp: Date.now(),
        }

        // Update category products if not already loaded
        if (!state.categorySubcategoryProducts[category]) {
          const groupedProducts: Record<string, Product[]> = {}

          products.forEach((product: Product) => {
            const subcategory = product.sub_category_name || "Uncategorized"
            if (!groupedProducts[subcategory]) {
              groupedProducts[subcategory] = []
            }
            groupedProducts[subcategory].push(product)
          })

          state.categorySubcategoryProducts[category] = groupedProducts
        }
      })
  },
})

export const { clearProducts, updateCache, clearCache } = productSlice.actions
export default productSlice.reducer
