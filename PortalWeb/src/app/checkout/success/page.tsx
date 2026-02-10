"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Package, CheckCircle } from "lucide-react"

interface OrderProduct {
  id: string
  title: string
  price: number
  quantity: number
  image_link: string
}

interface OrderDetails {
  orderId: string
  totalAmount: number
  products: OrderProduct[]
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we have any order data in session storage
    const hasOrderCompleted = sessionStorage.getItem("lastOrderCompleted")
    const storedOrderDetails = sessionStorage.getItem("orderDetails")

    if (storedOrderDetails) {
      try {
        const parsedDetails = JSON.parse(storedOrderDetails)

        // If we have an orderId, fetch the order details from the API
        if (orderId || parsedDetails.orderId) {
          fetchOrderDetails(orderId || parsedDetails.orderId)
        } else {
          setOrderDetails(parsedDetails)
          setLoading(false)
        }
      } catch (e) {
        console.error("Error parsing order details:", e)
        setLoading(false)
      }
    } else if (orderId) {
      // If we have an orderId but no stored details, fetch from API
      fetchOrderDetails(orderId)
    } else if (!hasOrderCompleted && !orderId) {
      // If no order was completed and no orderId in URL, redirect to home
      router.push("/")
    } else {
      setLoading(false)
    }

    // Clean up session storage after retrieving the data
    return () => {
      sessionStorage.removeItem("lastOrderCompleted")
      sessionStorage.removeItem("orderDetails")
    }
  }, [orderId, router])

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()
      console.log("=== DEBUG: Raw API Response ===")
      console.log("Full response:", JSON.stringify(data, null, 2))
      console.log("Products array:", data.products)
      if (data.products && data.products.length > 0) {
        console.log("First product:", JSON.stringify(data.products[0], null, 2))
        console.log("Product keys:", Object.keys(data.products[0]))
      }
      console.log("=== END DEBUG ===")
      console.log("Raw API response:", data)

      // Transform the data to match our OrderDetails interface
      const transformedData: OrderDetails = {
        orderId: data._id || data.orderId || id,
        totalAmount: data.totalAmount || data.total || 0,
        products:
          data.products?.map((product: any, index: number) => {
            console.log(`Processing product ${index}:`, product)

            // Try to extract product details from various possible structures
            let productTitle = "Product"
            let productPrice = 0
            let productQuantity = 1
            let imageUrl = "/placeholder.svg"

            // Extract title/name
            if (product.title && product.title.trim() !== "") {
              productTitle = product.title
            } else if (product.name && product.name.trim() !== "") {
              productTitle = product.name
            } else if (product.productName && product.productName.trim() !== "") {
              productTitle = product.productName
            }

            // Extract price
            if (typeof product.price === "number" && product.price > 0) {
              productPrice = product.price
            } else if (typeof product.price === "string" && product.price.trim() !== "") {
              const parsedPrice = Number.parseFloat(product.price)
              if (!isNaN(parsedPrice) && parsedPrice > 0) {
                productPrice = parsedPrice
              }
            }

            // Extract quantity
            if (typeof product.quantity === "number" && product.quantity > 0) {
              productQuantity = product.quantity
            } else if (typeof product.quantity === "string" && product.quantity.trim() !== "") {
              const parsedQuantity = Number.parseInt(product.quantity)
              if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
                productQuantity = parsedQuantity
              }
            }

            // Extract image URL
            const imageFields = ["image_link", "image", "imageUrl", "img", "thumbnail", "photo", "picture"]
            for (const field of imageFields) {
              if (product[field] && typeof product[field] === "string" && product[field].trim() !== "") {
                imageUrl = product[field]
                break
              }
            }

            const transformedProduct = {
              id: product.productId || product.product_id || product.id || `product-${index}`,
              title: productTitle,
              price: productPrice,
              quantity: productQuantity,
              image_link: imageUrl,
            }

            console.log(`Transformed product ${index}:`, transformedProduct)
            return transformedProduct
          }) || [],
      }

      console.log("Final transformed data:", transformedData)
      setOrderDetails(transformedData)
    } catch (error) {
      console.error("Error fetching order details:", error)
      // If API fetch fails, try to use the stored details
      const storedOrderDetails = sessionStorage.getItem("orderDetails")
      if (storedOrderDetails) {
        try {
          setOrderDetails(JSON.parse(storedOrderDetails))
        } catch (e) {
          console.error("Error parsing stored order details:", e)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg"
  }

  // Function to extract image URL from product data
  const extractImageUrl = (product: any): string => {
    // Try different possible field names for the image
    const possibleFields = ["image_link", "image", "imageUrl", "img", "thumbnail", "photo", "picture", "imageLink"]

    for (const field of possibleFields) {
      if (product[field] && typeof product[field] === "string" && product[field].trim() !== "") {
        return formatImageUrl(product[field])
      }
    }

    // If no image field is found, check if there's an images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0]
      if (typeof firstImage === "string") {
        return formatImageUrl(firstImage)
      } else if (firstImage && firstImage.url) {
        return formatImageUrl(firstImage.url)
      }
    }

    return "/placeholder.svg"
  }

  // Function to format image URLs correctly
  const formatImageUrl = (url: string | undefined): string => {
    if (!url || url.trim() === "") return "/placeholder.svg"

    const trimmedUrl = url.trim()

    // If URL is already absolute (starts with http or https), return as is
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl
    }

    // If URL starts with a slash, it's a relative URL from the root
    if (trimmedUrl.startsWith("/")) {
      return trimmedUrl
    }

    // If URL starts with data: (base64 image), return as is
    if (trimmedUrl.startsWith("data:")) {
      return trimmedUrl
    }

    // Otherwise, ensure it has a leading slash
    return `/${trimmedUrl}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-5xl w-full">
        {/* Success Header with Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your order has been placed successfully 🎉</h1>
        </div>

        {/* Two-column layout for Order Items and Order Summary */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Order Items Section - Left Column */}
          {orderDetails && orderDetails.products && orderDetails.products.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 md:w-[450px]">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                Order Items
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {orderDetails.products.map((product) => (
                  <div key={product.id} className="flex gap-3 border-b border-gray-100 pb-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={product.image_link || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{product.title}</h3>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Qty: {product.quantity}</span>
                        <span className="font-medium text-gray-700">₹{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary Section - Right Column */}
          {(orderId || (orderDetails && orderDetails.orderId)) && (
            <div className="bg-white rounded-lg shadow-md p-5 flex-1">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Order Reference:</span>
                  <span className="font-medium">{orderId || orderDetails?.orderId}</span>
                </div>

                {orderDetails && (
                  <>
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{orderDetails.products?.length || 0}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-lg">₹{orderDetails.totalAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-gray-600 mt-6 mb-6">
                Thank you for your order! Your purchase has been successfully placed. We are processing it and will
                update you with the shipping details shortly.
              </p>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-md transition-colors text-lg font-medium w-full"
              >
                SHOP MORE
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
