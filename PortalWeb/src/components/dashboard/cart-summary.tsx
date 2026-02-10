"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { increaseQuantity, decreaseQuantity, removeItem, clearCart } from "@/store/slices/cartSlice"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"

export default function CartSummary() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const router = useRouter()

  const handleIncrement = (id: string) => {
    dispatch(increaseQuantity(id))
  }

  const handleDecrement = (id: string) => {
    dispatch(decreaseQuantity(id))
  }

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  const handleReturnToShop = () => {
    router.push("/")
  }

  const calculateSubTotal = (price: number, quantity: number) => {
    return (price || 0) * (quantity || 0)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0
      const quantity = item.quantity || 0
      return total + calculateSubTotal(price, quantity)
    }, 0)
  }

  return (
    <Card className="flex flex-col relative justify-center max-w-4xl min-h-96 mx-auto p-6">
      <Toaster />
      <h1 className="absolute top-4 text-2xl font-bold">My Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-center">Your cart is empty.</p>
      ) : (
        <div className="mt-10 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20">
                  <Image
                    src={item.image_link || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="hover:bg-gray-200" onClick={() => handleDecrement(item.id)}>
                        -
                      </Button>
                      <p className="text-gray-600">{item.quantity}</p>
                      <Button variant="outline" className="hover:bg-gray-200" onClick={() => handleIncrement(item.id)}>
                        +
                      </Button>
                    </div>
                    <p className="text-gray-600 font-medium">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="hover:bg-red-600 hover:text-white"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold">₹{calculateTotal().toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearCart}>
                Clear Cart
              </Button>
              <Button className="bg-green-700 hover:bg-orange-500" onClick={handleReturnToShop}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
