"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"
import { useWishlistSync } from "@/hooks/useWishlistSync"
import { useCartSync } from "@/hooks/useCartSync"
import { toast } from "react-hot-toast"
import SingleAdvertisement from "@/components/layout/single-advertisement"

interface Product {
  product_id: number
  title: string
  image_link: string
  price: number
  discount?: number
  seller_id: number
  units?: string
  stock: number
  id: string
}

export default function WishlistPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const { wishlistItems, removeItem } = useWishlistSync()
  const { addItem: addToCart } = useCartSync()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products")
        const products: Product[] = response.data
        setProducts(products)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  const handleRemoveItem = (id: string) => {
    removeItem(id)
    toast.success("Removed from wishlist", {
      duration: 3000,
      position: "bottom-center",
    })
  }

  const handleAddToCart = (item: any) => {
    // Extract the product ID from the item.id URL
    const productIdFromUrl = item.id.split("/").pop()

    if (productIdFromUrl) {
      // Find the product in the fetched products array
      const product = products.find((p) => p.product_id === Number(productIdFromUrl))

      if (product) {
        addToCart({
          item: {
            id: item.id,
            title: item.title,
            image_link: item.image_link,
            price: item.price,
            discount: item.discount ?? 0,
            units: item.units,
            quantity: 1,
          },
          stock: product.stock, // Use the stock from the fetched product
        })

        toast.success("Product added in cart!", {
          duration: 2000,
          position: "bottom-center",
        })
      } else {
        console.error("Product not found when adding to cart:", item.id)
        toast.error("Could not add to cart: Product not found", {
          duration: 3000,
          position: "bottom-center",
        })
      }
    } else {
      console.error("Could not extract product ID from URL:", item.id)
      toast.error("Could not add to cart: Invalid product ID", {
        duration: 3000,
        position: "bottom-center",
      })
    }
  }

  const handleAddAllToCart = () => {
    let successCount = 0
    let errorCount = 0

    wishlistItems.forEach((item) => {
      // Extract the product ID from the item.id URL
      const productIdFromUrl = item.id.split("/").pop()

      if (productIdFromUrl) {
        // Find the product in the fetched products array
        const product = products.find((p) => p.product_id === Number(productIdFromUrl))

        if (product) {
          addToCart({
            item: {
              id: item.id,
              title: item.title,
              image_link: item.image_link,
              price: item.price,
              discount: item.discount ?? 0,
              units: item.units,
              quantity: 1,
            },
            stock: product.stock, // Use the stock from the fetched product
          })
          successCount++
        } else {
          console.error("Product not found when adding to cart:", item.id)
          errorCount++
        }
      } else {
        console.error("Could not extract product ID from URL:", item.id)
        errorCount++
      }
    })

    if (successCount > 0) {
      toast.success(`${successCount} product${successCount > 1 ? "s" : ""} added in cart!`, {
        duration: 2000,
        position: "bottom-center",
      })
    }

    if (errorCount > 0) {
      toast.error(`Failed to add ${errorCount} items to cart`, {
        duration: 3000,
        position: "bottom-center",
      })
    }
  }

  const calculateTotal = () => {
    return wishlistItems.reduce((total, item) => total + item.price, 0).toFixed(2)
  }

  const handleReturnToShop = () => {
    router.push("/")
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col relative justify-center max-w-4xl min-h-96 mx-auto p-6 w-full">
        <h1 className="absolute top-4 text-2xl font-bold">Your Wishlist</h1>
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-600 text-center mb-4">Your wishlist is empty.</p>
            <Button variant="outline" onClick={handleReturnToShop} className="bg-orange-300 hover:bg-green-600">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={handleAddAllToCart} className="bg-orange-300 hover:bg-green-600">
                Add All to Cart
              </Button>
            </div>

            {wishlistItems.map((item) => (
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
                    <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="hover:bg-red-600 hover:text-white bg-transparent"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-green-600 hover:text-white bg-orange-300"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold">₹{calculateTotal()}</p>
            </div>
          </div>
        )}
        {wishlistItems.length > 0 && (
          <Button variant="outline" onClick={handleReturnToShop} className="mt-4 bg-orange-300 hover:bg-green-600">
            Return to Shop
          </Button>
        )}
      </Card>

      {wishlistItems.length > 0 && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Sponsored</p>
          </div>
          <SingleAdvertisement position="wishlist" className="w-full" />
        </div>
      )}
    </div>
  )
}
