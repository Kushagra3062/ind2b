import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Define the Advertisement interface
export interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all"
  startDate?: string
  endDate?: string
}

// Define the state structure
interface AdvertisementState {
  advertisements: Advertisement[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: number | null
  deviceType: string | null
  isInitialized: boolean
}

// Initial state
const initialState: AdvertisementState = {
  advertisements: [],
  status: "idle",
  error: null,
  lastFetched: null,
  deviceType: null,
  isInitialized: false,
}

export const fetchAdvertisements = createAsyncThunk(
  "advertisements/fetchAdvertisements",
  async (
    { deviceType, position = "all" }: { deviceType: string; position?: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as { advertisements: AdvertisementState }

    const cacheValidityDuration = 20 * 60 * 1000 // 20 minutes
    const now = Date.now()

    // Check if we have valid cached data - return immediately
    if (
      state.advertisements.isInitialized &&
      state.advertisements.advertisements.length > 0 &&
      state.advertisements.lastFetched &&
      now - state.advertisements.lastFetched < cacheValidityDuration &&
      (state.advertisements.deviceType === deviceType || state.advertisements.deviceType === "all") &&
      state.advertisements.status === "succeeded"
    ) {
      return {
        advertisements: state.advertisements.advertisements,
        fromCache: true,
        deviceType,
        position,
        responseTime: 0,
      }
    }

    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const url = `/api/advertisements/active?deviceType=${deviceType}&position=all`

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch advertisements")
      }

      return {
        advertisements: result.data || [],
        fromCache: false,
        deviceType,
        position: "all",
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (error instanceof Error && error.name === "AbortError") {
        if (state.advertisements.advertisements.length > 0) {
          return {
            advertisements: state.advertisements.advertisements,
            fromCache: true,
            deviceType,
            position: "all",
            responseTime,
          }
        }
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return rejectWithValue(errorMessage)
    }
  },
)

// Create the slice
const advertisementSlice = createSlice({
  name: "advertisements",
  initialState,
  reducers: {
    clearAdvertisements: (state) => {
      state.advertisements = []
      state.status = "idle"
      state.lastFetched = null
      state.deviceType = null
      state.isInitialized = false
    },
    markAsInitialized: (state) => {
      state.isInitialized = true
    },
    // Preload action for instant loading
    preloadAdvertisements: (
      state,
      action: PayloadAction<{ advertisements: Advertisement[]; deviceType?: string; position?: string }>,
    ) => {
      state.advertisements = action.payload.advertisements
      state.status = "succeeded"
      state.isInitialized = true
      state.lastFetched = Date.now()
      state.deviceType = action.payload.deviceType || "all"
      state.error = null
    },
    // Instant load from cache
    loadFromCache: (state, action: PayloadAction<Advertisement[]>) => {
      if (state.advertisements.length === 0) {
        state.advertisements = action.payload
        state.status = "succeeded"
        state.isInitialized = true
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvertisements.pending, (state) => {
        if (!state.isInitialized || state.advertisements.length === 0) {
          state.status = "loading"
        }
        state.error = null
      })
      .addCase(
        fetchAdvertisements.fulfilled,
        (
          state,
          action: PayloadAction<{
            advertisements: Advertisement[]
            fromCache: boolean
            deviceType?: string
            position?: string
            responseTime?: number
          }>,
        ) => {
          state.status = "succeeded"
          state.advertisements = action.payload.advertisements
          state.isInitialized = true

          if (!action.payload.fromCache) {
            state.lastFetched = Date.now()
            state.deviceType = action.payload.deviceType || null
          }

          state.error = null
        },
      )
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        if (state.advertisements.length === 0) {
          state.status = "failed"
        }
        state.error = action.payload as string
        state.isInitialized = true
      })
  },
})

export const { clearAdvertisements, markAsInitialized, preloadAdvertisements, loadFromCache } =
  advertisementSlice.actions
export default advertisementSlice.reducer
