"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Zap } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { toast } from "react-hot-toast"
import { AuthModal } from "@/components/auth/auth-modal"
import { getCurrentUser } from "@/actions/auth"
import { useCartSync } from "@/hooks/useCartSync"
import { useWishlistSync } from "@/hooks/useWishlistSync"
import { getDisplayPrice } from "@/lib/price-helper"

interface ProductActionsProps {
  productId: string
  title: string
  price: number
  final_price?: number
  imageUrl: string
  discount?: number
  sellerId: number
  stock: number
  units?: string
  productImages: string[]
}

const sanitizeFilename = (title: string): string => {
  return title
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .toLowerCase()
}

export default function ProductActions({
  productId,
  title,
  price,
  final_price,
  imageUrl,
  discount = 0,
  sellerId,
  stock,
  units = "units",
  productImages,
}: ProductActionsProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [buyNowClicked, setBuyNowClicked] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false)
  const router = useRouter()

  // Get wishlist items from Redux store
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  // Check if this product is in the wishlist
  useEffect(() => {
    const itemInWishlist = wishlistItems.some((item) => item.id === productId)
    setIsWishlisted(itemInWishlist)
  }, [wishlistItems, productId])

  const { addItem: addToCart } = useCartSync()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isLoading: wishlistLoading } = useWishlistSync()

  useEffect(() => {
    const recordView = async () => {
      try {
        // Fire-and-forget server record for logged-in users
        fetch("/api/browsing-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            title,
            image: imageUrl,
          }),
          keepalive: true,
        }).catch(() => {})

        // LocalStorage fallback for guests - wrapped in try-catch
        try {
          const key = "guest_browsing_history"
          const existing = JSON.parse(localStorage.getItem(key) || "[]") as Array<any>
          const filtered = existing.filter((x) => x.productId !== productId)
          filtered.unshift({ productId, title, image: imageUrl, viewedAt: Date.now() })
          const limited = filtered.slice(0, 20)
          localStorage.setItem(key, JSON.stringify(limited))
        } catch (_e) {
          // ignore localStorage errors
        }
      } catch (_err) {
        // ignore all errors
      }
    }

    const timeoutId = setTimeout(recordView, 100)
    return () => clearTimeout(timeoutId)
  }, [productId, title, imageUrl])

  const displayPrice = getDisplayPrice(price, final_price)

  // Handle adding to cart
  const handleAddToCart = useCallback(() => {
    addToCart({
      item: {
        id: productId,
        title,
        image_link: imageUrl,
        price: Math.round(displayPrice),
        discount,
        seller_id: sellerId,
        units,
        quantity: 1,
      },
      stock,
    })

    toast.success("Product added in cart!", {
      duration: 2000,
      position: "bottom-center",
    })
  }, [addToCart, productId, title, imageUrl, displayPrice, discount, sellerId, units, stock])

  // Handle Buy Now functionality
  const handleBuyNow = useCallback(async () => {
    if (stock <= 0) {
      toast.error("Product is out of stock", {
        duration: 3000,
        position: "bottom-center",
      })
      return
    }

    setIsCheckingUser(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        // User is logged in, add to cart and proceed to checkout
        addToCart({
          item: {
            id: productId,
            title,
            image_link: imageUrl,
            price: Math.round(displayPrice),
            discount,
            seller_id: sellerId,
            units,
            quantity: 1,
          },
          stock,
        })
        router.push("/checkout")
      } else {
        // User is not logged in, show auth modal
        setBuyNowClicked(true)
        setIsAuthModalOpen(true)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      // If there's an error, show auth modal to be safe
      setBuyNowClicked(true)
      setIsAuthModalOpen(true)
    } finally {
      setIsCheckingUser(false)
    }
  }, [addToCart, productId, title, imageUrl, displayPrice, discount, sellerId, units, stock, router])

  const handleAuthSuccess = useCallback(() => {
    // Close the auth modal
    setIsAuthModalOpen(false)

    if (buyNowClicked) {
      // If buy now was clicked, add to cart and proceed to checkout
      addToCart({
        item: {
          id: productId,
          title,
          image_link: imageUrl,
          price: Math.round(displayPrice),
          discount,
          seller_id: sellerId,
          units,
          quantity: 1,
        },
        stock,
      })
      router.push("/checkout")
      setBuyNowClicked(false)
    }
  }, [addToCart, buyNowClicked, productId, title, imageUrl, displayPrice, discount, sellerId, units, stock, router])

  // Handle toggling wishlist
  const handleToggleWishlist = useCallback(async () => {
    // Prevent multiple clicks while processing
    if (isProcessingWishlist || wishlistLoading) return

    setIsProcessingWishlist(true)

    try {
      if (isWishlisted) {
        // If already in wishlist, remove it
        await removeFromWishlist(productId)
        toast.success("Removed from wishlist", {
          duration: 3000,
          position: "bottom-center",
        })
      } else {
        // If not in wishlist, add it
        await addToWishlist({
          id: productId,
          title,
          image_link: imageUrl,
          price: Math.round(price),
          discount,
          seller_id: sellerId,
          units: undefined,
          stock: 0,
        })
        toast.success("Added to wishlist successfully!", {
          duration: 3000,
          position: "bottom-center",
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Error updating wishlist. Please try again.", {
        duration: 3000,
        position: "bottom-center",
      })
    } finally {
      // Add a small delay before allowing another action
      setTimeout(() => {
        setIsProcessingWishlist(false)
      }, 300)
    }
  }, [
    isProcessingWishlist,
    wishlistLoading,
    isWishlisted,
    removeFromWishlist,
    productId,
    addToWishlist,
    title,
    imageUrl,
    price,
    discount,
    sellerId,
  ])

  return (
    <>
      {/* Main product image container with wishlist button */}
      <div className="relative flex flex-col items-center md:ml-8">
        <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200 mb-4">
          {/* Wishlist heart button */}
          <button
            onClick={handleToggleWishlist}
            disabled={isProcessingWishlist || wishlistLoading}
            className={`absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 ${
              isProcessingWishlist || wishlistLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-6 h-6 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}`}
            />
          </button>

          <a
            href={productImages[0] || "/placeholder.svg"}
            download={sanitizeFilename(title)}
            className="block"
            onClick={(e) => {
              // Prevent navigation, only allow download
              e.preventDefault()
            }}
          >
            <img
              src={productImages[0] || "/placeholder.svg"}
              alt={title}
              className="w-full h-[400px] object-contain"
              crossOrigin="anonymous"
            />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="w-full">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className="bg-orange-400 hover:bg-orange-500 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors"
              disabled={isCheckingUser}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors"
              disabled={isCheckingUser}
            >
              <Zap className="w-5 h-5 mr-2" />
              {isCheckingUser ? "PLEASE WAIT..." : "BUY NOW"}
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  )
}
