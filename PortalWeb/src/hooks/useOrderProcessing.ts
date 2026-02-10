"use client"

import { useState, useCallback } from "react"
import { useDispatch } from "react-redux"
import { decrementCartQuantities, fetchCart } from "@/store/slices/cartSlice"
import type { AppDispatch } from "@/store"

interface OrderItem {
  productId: string
  quantity: number
}

interface UseOrderProcessingReturn {
  processOrder: (orderItems: OrderItem[]) => Promise<{
    success: boolean
    message: string
    errors?: string[]
  }>
  isProcessing: boolean
  error: string | null
}

export function useOrderProcessing(): UseOrderProcessingReturn {
  const dispatch = useDispatch<AppDispatch>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processOrder = useCallback(
    async (orderItems: OrderItem[]) => {
      setIsProcessing(true)
      setError(null)

      try {
        // Decrement cart quantities
        const result = await dispatch(decrementCartQuantities(orderItems))

        if (decrementCartQuantities.fulfilled.match(result)) {
          // Refresh cart to ensure UI consistency
          await dispatch(fetchCart())

          return {
            success: true,
            message: result.payload.message,
            errors: result.payload.errors,
          }
        } else {
          const errorMessage = (result.payload as string) || "Failed to process order"
          setError(errorMessage)
          return {
            success: false,
            message: errorMessage,
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage,
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [dispatch],
  )

  return {
    processOrder,
    isProcessing,
    error,
  }
}
