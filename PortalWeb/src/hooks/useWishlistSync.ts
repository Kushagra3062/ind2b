"use client"

import { useState, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch } from "@/store"
import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
  addToWishlist as addToWishlistLocal,
  removeFromWishlist as removeFromWishlistLocal,
} from "@/store/slices/wishlistSlice"
import type { RootState } from "@/store"
import { getCurrentUser } from "@/actions/auth"

// Define a type for wishlist items
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

export function useWishlistSync() {
  const dispatch = useDispatch<AppDispatch>()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const status = useSelector((state: RootState) => state.wishlist.status)
  const [isLoading, setIsLoading] = useState(false)
  const initRef = useRef(false)

  // Initialize wishlist from database - only runs once
  const initWishlist = useCallback(async () => {
    // Use a ref to ensure this only runs once
    if (initRef.current) return
    initRef.current = true

    try {
      const user = await getCurrentUser()
      if (user) {
        await dispatch(fetchWishlist()).unwrap()
      }
    } catch (error) {
      console.error("Error initializing wishlist:", error)
    }
  }, [dispatch])

  // Add item to wishlist - direct approach with no synchronization
  const addItem = useCallback(
    async (item: WishlistItem) => {
      if (isLoading) return false

      try {
        setIsLoading(true)
        const user = await getCurrentUser()

        // If user is logged in, add to database via API
        if (user) {
          await dispatch(addWishlistItem(item)).unwrap()
        } else {
          // If user is not logged in, just add to local state
          dispatch(addToWishlistLocal(item))
        }
        return true
      } catch (error) {
        console.error("Error adding item to wishlist:", error)
        // Fall back to local state if API call fails
        dispatch(addToWishlistLocal(item))
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, isLoading],
  )

  // Remove item from wishlist - direct approach with no synchronization
  const removeItem = useCallback(
    async (productId: string) => {
      if (isLoading) return false

      try {
        setIsLoading(true)
        const user = await getCurrentUser()

        // If user is logged in, remove from database via API
        if (user) {
          await dispatch(removeWishlistItem(productId)).unwrap()
        } else {
          // If user is not logged in, just remove from local state
          dispatch(removeFromWishlistLocal(productId))
        }
        return true
      } catch (error) {
        console.error("Error removing item from wishlist:", error)
        // Fall back to local state if API call fails
        dispatch(removeFromWishlistLocal(productId))
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, isLoading],
  )

  return {
    wishlistItems,
    status,
    isLoading,
    addItem,
    removeItem,
    initWishlist,
  }
}
