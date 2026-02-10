"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { setCartFromDb } from "@/store/slices/cartSlice"
import axios from "axios"
import { getCurrentUser } from "@/actions/auth"
import type { AppDispatch } from "@/store"

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return

    const initializeCart = async () => {
      try {
        hasInitialized.current = true

        const user = await getCurrentUser()

        if (!user) {
          dispatch(setCartFromDb([]))
          return
        }

        console.log("CartProvider: Initializing cart from database...")
        const response = await axios.get("/api/cart")
        const dbItems = response.data.items || []

        dispatch(setCartFromDb(dbItems))
      } catch (error) {
        console.error("CartProvider: Error initializing cart:", error)
        dispatch(setCartFromDb([]))
      }
    }

    initializeCart()
  }, [dispatch])

  return <>{children}</>
}
