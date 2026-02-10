"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CheckCircle, ShoppingCart, Package, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { decrementCartQuantities, fetchCart } from "@/store/slices/cartSlice"
import type { RootState, AppDispatch } from "@/store"

interface OrderConfirmationProps {
  orderId: string
  orderItems: Array<{
    productId: string
    title: string
    quantity: number
    price: number
  }>
  onContinueShopping: () => void
  onViewOrder: () => void
}

export default function OrderConfirmation({
  orderId,
  orderItems,
  onContinueShopping,
  onViewOrder,
}: OrderConfirmationProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { items: cartItems, orderProcessing, error } = useSelector((state: RootState) => state.cart)
  const [cartUpdateStatus, setCartUpdateStatus] = useState<"pending" | "success" | "error" | null>(null)
  const [removedItems, setRemovedItems] = useState<string[]>([])

  useEffect(() => {
    // Automatically update cart quantities after order confirmation
    const updateCartQuantities = async () => {
      setCartUpdateStatus("pending")

      try {
        const orderedItems = orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))

        const result = await dispatch(decrementCartQuantities(orderedItems))

        if (decrementCartQuantities.fulfilled.match(result)) {
          setCartUpdateStatus("success")
          if (result.payload.removedItems) {
            setRemovedItems(result.payload.removedItems)
          }
          // Refresh cart to ensure consistency
          dispatch(fetchCart())
        } else {
          setCartUpdateStatus("error")
        }
      } catch (error) {
        console.error("Error updating cart quantities:", error)
        setCartUpdateStatus("error")
      }
    }

    updateCartQuantities()
  }, [dispatch, orderItems])

  const totalOrderValue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const remainingCartItems = cartItems.length

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Order Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Order Placed Successfully!</CardTitle>
          <p className="text-green-700">
            Order ID: <span className="font-mono font-semibold">#{orderId}</span>
          </p>
        </CardHeader>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
            <span>Total</span>
            <span>₹{totalOrderValue.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cart Update Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart Update Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cartUpdateStatus === "pending" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Updating your cart quantities...</AlertDescription>
            </Alert>
          )}

          {cartUpdateStatus === "success" && (
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your cart has been updated successfully! Ordered quantities have been removed from your cart.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Items remaining in cart:</span>
                <Badge variant="secondary">{remainingCartItems} items</Badge>
              </div>

              {removedItems.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Items completely removed from cart:</p>
                  <p className="text-xs text-blue-600">
                    {removedItems.length} item(s) were fully ordered and removed from your cart
                  </p>
                </div>
              )}
            </div>
          )}

          {cartUpdateStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                There was an issue updating your cart. Your order was placed successfully, but please check your cart
                manually.
                {error && <span className="block mt-1 text-xs">Error: {error}</span>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onViewOrder} className="flex-1" disabled={orderProcessing}>
          View Order Details
        </Button>
        <Button onClick={onContinueShopping} variant="outline" className="flex-1" disabled={orderProcessing}>
          Continue Shopping
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-blue-800">
            <p>• You will receive an order confirmation email shortly</p>
            <p>• Track your order status in the "My Orders" section</p>
            <p>• For any queries, contact our customer support</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
