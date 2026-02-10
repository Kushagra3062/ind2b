"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { fetchWishlist } from "@/store/slices/wishlistSlice"
import { getCurrentUser } from "@/actions/auth"
import type { AppDispatch } from "@/store"

interface WishlistProviderProps {
  children: React.ReactNode
}

export default function WishlistProvider({ children }: WishlistProviderProps) {
  const dispatch = useDispatch<AppDispatch>()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return

    const initializeWishlist = async () => {
      try {
        hasInitialized.current = true

        const user = await getCurrentUser()

        if (user) {
          await dispatch(fetchWishlist()).unwrap()
        }
      } catch (error) {
        console.error("WishlistProvider: Error initializing wishlist:", error)
      }
    }

    initializeWishlist()
  }, [dispatch])

  return <>{children}</>
}
