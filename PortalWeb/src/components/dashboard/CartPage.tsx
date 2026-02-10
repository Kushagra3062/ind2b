"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store"
import { updateItemStock } from "@/store/slices/cartSlice"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { getCurrentUser } from "@/actions/auth"
import axios from "axios"
import { Toaster } from "@/components/ui/sonner"
//import { toast } from "@/components/ui/use-toast"
import { useCartSync } from "@/hooks/useCartSync"

export default function CartPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [stockWarnings, setStockWarnings] = useState<Record<string, boolean>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCheckingUser, setIsCheckingUser] = useState(true)
  const [isLoadingStock, setIsLoadingStock] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setIsCheckingUser(false)
      }
    }

    checkUser()
  }, [])

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const { removeItem, increaseQuantity, decreaseQuantity } = useCartSync()

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  const handleProceedToCheckout = async () => {
    setIsCheckingUser(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        // User is logged in, proceed to checkout
        router.push("/checkout")
      } else {
        // User is not logged in, show auth modal
        setIsAuthModalOpen(true)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      // If there's an error, show auth modal to be safe
      setIsAuthModalOpen(true)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const handleAuthSuccess = () => {
    // Close the auth modal
    setIsAuthModalOpen(false)
    // Redirect to checkout page
    router.push("/checkout")
  }

  // Fetch real-time stock information for all cart items
  useEffect(() => {
    const fetchProductStocks = async () => {
      if (cartItems.length === 0) return

      setIsLoadingStock(true)
      try {
        // Fetch all products to get their current stock
        const response = await axios.get("/api/products")
        const products = response.data

        // Update stock information for each cart item
        cartItems.forEach((item) => {
          const productId = Number.parseInt(item.id)
          const product = products.find((p: any) => p.product_id === productId)

          if (product) {
            // Update the stock in the cart state
            dispatch(
              updateItemStock({
                productId: item.id,
                stock: product.stock,
              }),
            )

            // Check if we need to show a warning (quantity exceeds stock)
            if (item.quantity > product.stock) {
              setStockWarnings((prev) => ({ ...prev, [item.id]: true }))

              // If quantity exceeds available stock, adjust it
              if (product.stock > 0) {
                // Reduce quantity to match available stock
                while (item.quantity > product.stock) {
                  decreaseQuantity(item.id)
                }
              } else {
                // If product is out of stock, remove it from cart
                removeItem(item.id)
              }
            }
          }
        })
      } catch (error) {
        console.error("Error fetching product stocks:", error)
      } finally {
        setIsLoadingStock(false)
      }
    }

    fetchProductStocks()
  }, [cartItems.length, dispatch, decreaseQuantity, removeItem])

  const handleIncrement = (id: string) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      if (item.quantity >= item.stock) {
        // Show warning if trying to add more than available stock
        setStockWarnings((prev) => ({ ...prev, [id]: true }))
        return
      }

      // Clear warning if it was previously shown
      if (stockWarnings[id]) {
        setStockWarnings((prev) => {
          const newWarnings = { ...prev }
          delete newWarnings[id]
          return newWarnings
        })
      }

      increaseQuantity(id)
    }
  }

  const handleDecrement = (id: string) => {
    const item = cartItems.find((item) => item.id === id)
    if (item && item.quantity <= 1) {
      // If quantity is 1 or less, remove the item completely
      removeItem(id)
    } else {
      // Otherwise just decrease the quantity
      decreaseQuantity(id)

      // Clear warning if it was previously shown
      if (stockWarnings[id]) {
        setStockWarnings((prev) => {
          const newWarnings = { ...prev }
          delete newWarnings[id]
          return newWarnings
        })
      }
    }
  }

  const calculateSubTotal = (price: number, quantity: number) => {
    return (price || 0) * (quantity || 0)
  }

  const calculateTotalCart = () => {
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
                  <p className="text-gray-600">
                    ₹{item.price.toFixed(2)} x {item.quantity}
                  </p>
                  <p className="text-gray-600 font-medium">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {item.stock} {item.stock === 1 ? "unit" : "units"}
                  </p>
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
              <p className="text-2xl font-bold">₹{calculateTotalCart()}</p>
            </div>
            <Button
              onClick={handleProceedToCheckout}
              disabled={isCheckingUser}
              className="bg-green-700 hover:bg-orange-500"
            >
              {isCheckingUser ? "PLEASE WAIT..." : "Proceed to Checkout"}
            </Button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </Card>
  )
}
