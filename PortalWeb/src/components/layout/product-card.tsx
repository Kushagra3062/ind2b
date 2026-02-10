"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Building2, Heart, MapPin, ShoppingCart, Star } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useCartSync } from "@/hooks/useCartSync"
import { useWishlistSync } from "@/hooks/useWishlistSync"
import { toast } from "react-hot-toast"
import { generateProductUrl } from "@/lib/utils"
import { getDisplayPrice } from "@/lib/price-helper" // Import price helper

interface ProductCardProps {
  title: string
  company: string
  location: string
  price: number
  final_price?: number // Added final_price prop
  originalPrice: number
  discount: number
  gst?: number
  image_link: string
  hoverImage: string
  href: string
  rating: number
  reviewCount?: number
  seller_id: number
  units?: string
  stock: number
}

// Memoized star rating component for better performance
const StarRating = memo(({ rating }: { rating: number }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  // Add full stars (yellow filled)
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative inline-block">
        <Star className="w-4 h-4 text-gray-300 fill-gray-300" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      </div>,
    )
  }

  // Add empty stars (gray)
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-gray-300" />)
  }

  return <div className="flex items-center gap-0.5">{stars}</div>
})

StarRating.displayName = "StarRating"

// Memoized price calculation for better performance
const usePriceCalculation = (basePrice: number, gst = 0, discount = 0) => {
  return useCallback(() => {
    // Step 1: Add GST to base price
    const gstAmount = (basePrice * gst) / 100
    const priceWithGST = basePrice + gstAmount

    // Step 2: Apply discount to price with GST
    const discountAmount = (priceWithGST * discount) / 100
    const finalPrice = priceWithGST - discountAmount

    return {
      basePrice,
      gstAmount,
      priceWithGST,
      discountAmount,
      finalPrice,
    }
  }, [basePrice, gst, discount])
}

const ProductCard = memo(function ProductCard({
  title,
  company,
  location,
  price,
  final_price, // Added final_price destructuring
  originalPrice,
  discount,
  gst = 0,
  image_link,
  hoverImage,
  href,
  rating,
  reviewCount = 0,
  seller_id,
  units,
  stock,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get wishlist items from Redux store
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  // Extract product ID from href
  const productId = href.split("/").pop() || ""

  const seoFriendlyUrl = generateProductUrl(productId, title)

  const displayPrice = getDisplayPrice(price, final_price)

  // Memoized price calculation
  const calculatePrice = usePriceCalculation(displayPrice, gst, discount)
  const priceCalculation = calculatePrice()

  // Check if this product is in the wishlist - optimized
  useEffect(() => {
    const itemInWishlist = wishlistItems.some((item) => item.id === href)
    setIsWishlisted(itemInWishlist)
  }, [wishlistItems, href])

  const { addItem: addToCart } = useCartSync()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isLoading: wishlistLoading } = useWishlistSync()

  // Optimized add to cart handler
  const handleAddToCart = useCallback(() => {
    addToCart({
      item: {
        id: href,
        title,
        image_link,
        price: priceCalculation.finalPrice,
        discount,
        seller_id,
        units,
        quantity: 1,
      },
      stock: stock,
    })

    toast.success("Product added in cart!", {
      duration: 2000,
      position: "bottom-center",
    })
  }, [addToCart, href, title, image_link, priceCalculation.finalPrice, discount, seller_id, units, stock])

  // Optimized wishlist toggle handler
  const handleToggleWishlist = useCallback(async () => {
    if (isProcessingWishlist || wishlistLoading) return

    setIsProcessingWishlist(true)

    try {
      if (isWishlisted) {
        await removeFromWishlist(href)
        toast.success("Removed from wishlist", {
          duration: 1500,
          position: "bottom-center",
        })
      } else {
        await addToWishlist({
          id: href,
          title,
          image_link,
          price: priceCalculation.finalPrice,
          discount,
          seller_id,
          units: undefined,
          stock: 0,
        })
        toast.success("Added to wishlist!", {
          duration: 1500,
          position: "bottom-center",
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Error updating wishlist", {
        duration: 1500,
        position: "bottom-center",
      })
    } finally {
      setTimeout(() => {
        setIsProcessingWishlist(false)
      }, 200)
    }
  }, [
    isProcessingWishlist,
    wishlistLoading,
    isWishlisted,
    removeFromWishlist,
    href,
    addToWishlist,
    title,
    image_link,
    priceCalculation.finalPrice,
    discount,
    seller_id,
  ])

  // Optimized image error handler
  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  return (
    <div
      className="group transform transition-all duration-200 hover:scale-[0.98]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-200 
        border ${isHovered ? "border-green-900 border-2" : "border-gray-200 border"}`}
      >
        <Link href={seoFriendlyUrl} prefetch={true}>
          <div className="relative aspect-square overflow-hidden p-2 bg-white-100">
            <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
              <Image
                src={imageError ? "/placeholder.svg?height=200&width=200" : isHovered ? hoverImage : image_link}
                alt={title}
                fill
                className="object-cover transition-opacity duration-200 rounded-lg"
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                quality={75}
                loading="lazy"
                onError={handleImageError}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          </div>
        </Link>

        <div className="p-2 space-y-1.5">
          {/* Product Title with href */}
          <Link
            href={seoFriendlyUrl}
            prefetch={true}
            className="block hover:text-green-900 transition-colors duration-200"
          >
            <h3 className="text-gray-800 font-medium text-sm line-clamp-2 min-h-[2.4rem] hover:text-gray-800">
              {title}
            </h3>
          </Link>

          {/* Star Rating with Review Count - Memoized */}
          <div className="flex items-center gap-1">
            <StarRating rating={rating} />
            <span className="ml-1 text-xs text-gray-600 font-medium">({rating > 0 ? rating.toFixed(1) : "0.0"})</span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">
                • {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Company */}
          <div className="flex items-center gap-1 text-gray-600">
            <Building2 className="w-3 h-3" />
            <span className="text-xs">{company}</span>
          </div>

          {/* Pricing - Updated to use display price */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-sm font-bold text-green-900">₹{priceCalculation.finalPrice.toFixed(2)}</span>
              {discount && discount > 0 && (
                <span className="block text-xs text-gray-500 line-through">
                  ₹{priceCalculation.priceWithGST.toFixed(2)}
                </span>
              )}
            </div>
            {discount && discount > 0 && (
              <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded">{discount}% off</span>
            )}
          </div>

          {/* Bottom row with location and actions */}
          <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-gray-100">
            {/* Location info with icon */}
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3 h-3" />
              <span className="text-xs truncate max-w-[80px]">{location}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="px-3 py-0.5 bg-green-900 text-white text-xs font-medium rounded hover:bg-green-800 transition-colors duration-200 flex items-center gap-1"
              >
                <ShoppingCart className="w-3 h-3" />
                Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={isProcessingWishlist || wishlistLoading}
                className={`p-0.5 rounded-full border ${
                  isWishlisted ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                } hover:bg-gray-100 transition-colors duration-200 ${
                  isProcessingWishlist || wishlistLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">Available: {stock} units</p>
        </div>
      </div>
    </div>
  )
})

// Export memoized component for better performance
export default ProductCard
