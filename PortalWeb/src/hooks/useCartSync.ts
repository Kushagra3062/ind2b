"use client"

import { useDispatch, useSelector } from "react-redux"
import {
  addItem as addItemAction,
  removeItem as removeItemAction,
  increaseQuantity as increaseQuantityAction,
  decreaseQuantity as decreaseQuantityAction,
  clearCart as clearCartAction,
} from "@/store/slices/cartSlice"
import type { RootState, AppDispatch } from "@/store"
import { useCallback, useState } from "react"
import axios from "axios"
import { getCurrentUser } from "@/actions/auth"
import { toast } from "sonner"

export function useCartSync() {
  const dispatch = useDispatch<AppDispatch>()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [isLoading, setIsLoading] = useState(false)

  // Add item to cart
  const addItem = useCallback(
    async (payload: any) => {
      if (isLoading) return

      try {
        setIsLoading(true)

        // Update Redux state first (optimistic update)
        dispatch(addItemAction(payload))

        // Then update database if user is logged in
        const user = await getCurrentUser()
        if (user) {
          // Find the item we just added
          const newItem = {
            id: payload.item.id,
            title: payload.item.title,
            image_link: payload.item.image_link,
            price: Number(payload.item.price),
            discount: Number(payload.item.discount || 0),
            units: payload.item.units,
            quantity: Number(payload.item.quantity || 1),
            stock: Number(payload.stock || 0),
          }

          // Add item to database
          await axios.post("/api/cart/items", newItem)
        }
      } catch (error) {
        console.error("Error adding item to cart:", error)
        toast.error("Failed to add item to cart")
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, isLoading],
  )

  // Remove item from cart
  const removeItem = useCallback(
    async (id: string) => {
      if (isLoading) return

      try {
        setIsLoading(true)

        // Update Redux state first (optimistic update)
        dispatch(removeItemAction(id))

        // Then update database if user is logged in
        const user = await getCurrentUser()
        if (user) {
          await axios.delete(`/api/cart/items?id=${id}`)
        }
      } catch (error) {
        console.error("Error removing item from cart:", error)
        toast.error("Failed to remove item from cart")
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, isLoading],
  )

  // Increase quantity
  const increaseQuantity = useCallback(
    async (id: string) => {
      if (isLoading) return

      try {
        setIsLoading(true)

        // Get current quantity before updating
        const item = cartItems.find((item) => item.id === id)
        const currentQuantity = item?.quantity || 0

        // Update Redux state first (optimistic update)
        dispatch(increaseQuantityAction(id))

        // Then update database if user is logged in
        const user = await getCurrentUser()
        if (user) {
          await axios.put("/api/cart/items", {
            id,
            quantity: currentQuantity + 1,
          })
        }
      } catch (error) {
        console.error("Error increasing quantity:", error)
        toast.error("Failed to update quantity")
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, isLoading, cartItems],
  )

  // Decrease quantity
  const decreaseQuantity = useCallback(
    async (id: string) => {
      if (isLoading) return

      try {
        setIsLoading(true)

        // Get current quantity before updating
        const item = cartItems.find((item) => item.id === id)
        const currentQuantity = item?.quantity || 0

        // If quantity is 1, remove the item
        if (currentQuantity <= 1) {
          await removeItem(id)
          return
        }

        // Update Redux state first (optimistic update)
        dispatch(decreaseQuantityAction(id))

        // Then update database if user is logged in
        const user = await getCurrentUser()
        if (user) {
          await axios.put("/api/cart/items", {
            id,
            quantity: currentQuantity - 1,
          })
        }
      } catch (error) {
        console.error("Error decreasing quantity:", error)
        toast.error("Failed to update quantity")
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, isLoading, cartItems, removeItem],
  )

  // Clear cart
  const clearCart = useCallback(async () => {
    if (isLoading) return

    try {
      setIsLoading(true)

      // Update Redux state first (optimistic update)
      dispatch(clearCartAction())

      // Then update database if user is logged in
      const user = await getCurrentUser()
      if (user) {
        await axios.delete("/api/cart")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast.error("Failed to clear cart")
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, isLoading])

  return {
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    isLoading,
  }
}
