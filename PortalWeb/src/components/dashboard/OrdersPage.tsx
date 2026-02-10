"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  Star,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Hash,
  FileText,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { InvoiceModal } from "./InvoiceModal"
import { RatingModal } from "./RatingModal"
import { SendEmailButton } from "./SendEmailButton"

export interface OrderItem {
  image_link: string
  id: string
  name: string
  image: string
  price: number
  quantity: number
  actualProductId?: string
}

export interface ShippingDetails {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface LogisticsInfo {
  warehouseId: string | null
  logisticsId: string | null
  trackingId?: string
  estimatedDelivery?: string
}

export interface Order {
  id: string
  originalOrderId?: string
  date: string
  total: number
  subtotal: number
  tax: number
  shipTo: string
  status: string
  paymentMethod?: string
  items: OrderItem[]
  shippingDetails?: ShippingDetails
  logistics?: LogisticsInfo
}

export interface ReviewStatus {
  hasReview: boolean
  reviewId?: string
  rating?: number
  status?: string
  reviewText?: string
  createdAt?: string
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [timeFilter, setTimeFilter] = useState("all")
  const [hiddenRatingBanners, setHiddenRatingBanners] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [debug, setDebug] = useState<any>(null)
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [ratingOrderId, setRatingOrderId] = useState<string>("")
  const [ratingProductId, setRatingProductId] = useState<string>("")
  const [ratingProductName, setRatingProductName] = useState<string>("")
  const [ratingProductImage, setRatingProductImage] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 3

  // Simple function to extract product ID - just get the actual product_id from database
  const getActualProductId = (product: any): string => {
    console.log("Raw product data:", product)

    // First try product_id field (this is the main field in database)
    if (product.product_id) {
      console.log("Found product_id:", product.product_id)
      return product.product_id.toString()
    }

    // Then try productId field as fallback
    if (product.productId) {
      console.log("Found productId:", product.productId)
      return product.productId.toString()
    }

    // If neither exists, return empty string
    console.log("No product ID found")
    return ""
  }

  const checkReviewStatuses = async (productIds: string[]) => {
    try {
      console.log("Checking review statuses for product IDs:", productIds)

      const reviewPromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(`/api/reviews?productId=${productId}&userId=current`)
          if (response.ok) {
            const data = await response.json()
            console.log(`Review check for product ${productId}:`, data)

            if (data.reviews && data.reviews.length > 0) {
              const review = data.reviews[0]
              return {
                productId,
                hasReview: true,
                reviewId: review._id,
                rating: review.rating,
                status: review.status,
                reviewText: review.review,
                createdAt: review.createdAt,
              }
            }
          }
          return { productId, hasReview: false }
        } catch (error) {
          console.error(`Error checking review for product ${productId}:`, error)
          return { productId, hasReview: false }
        }
      })

      const results = await Promise.all(reviewPromises)
      const statusMap: Record<string, ReviewStatus> = {}

      results.forEach((result) => {
        statusMap[result.productId] = {
          hasReview: result.hasReview,
          reviewId: result.reviewId,
          rating: result.rating,
          status: result.status,
          reviewText: result.reviewText,
          createdAt: result.createdAt,
        }
      })

      console.log("Review status map:", statusMap)
      setReviewStatuses(statusMap)
    } catch (error) {
      console.error("Error checking review statuses:", error)
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        setDebug(data)
        console.log("Raw order data:", data)

        const mappedOrders: Order[] = data.map((order: any) => {
          console.log("Processing order:", order._id || order.orderId)
          console.log("Order products:", order.products)

          const items =
            order.products?.map((product: any, index: number) => {
              console.log(`\n=== Processing Product ${index} ===`)
              console.log("Full product object:", product)

              // Get the actual product ID directly from the database fields
              const actualProductId = getActualProductId(product)
              console.log(`Final product ID for product ${index}:`, actualProductId)

              const imageUrl = extractImageUrl(product)
              const uniqueReactId = `${actualProductId || "unknown"}-${index}-${order._id || order.orderId}-${Date.now()}`

              return {
                id: uniqueReactId,
                actualProductId: actualProductId,
                name: product.title || `Product ${index + 1}`,
                image: imageUrl,
                image_link: imageUrl,
                price: product.price || 0,
                quantity: product.quantity || 1,
              }
            }) || []

          const shippingDetails: ShippingDetails = {
            firstName: order.billingDetails?.firstName || "",
            lastName: order.billingDetails?.lastName || "",
            email: order.billingDetails?.email || "",
            address: order.billingDetails?.address || "",
            city: order.billingDetails?.city || "",
            state: order.billingDetails?.state || "",
            zipCode: order.billingDetails?.zipCode || "",
            country: order.billingDetails?.country || "",
          }

          const logistics: LogisticsInfo = {
            warehouseId: order.warehouseId === null ? "null" : order.warehouseId || "null",
            logisticsId: order.logisticsId === null ? "null" : order.logisticsId || "null",
            trackingId: order.trackingId || "Not available",
            estimatedDelivery: order.estimatedDelivery || "",
          }

          const subtotal = order.subTotal || 0
          const tax = order.tax || 0
          const total = order.totalAmount || subtotal + tax

          return {
            id: order._id || order.orderId || "N/A",
            date: order.createdAt || new Date().toISOString(),
            subtotal: subtotal,
            tax: tax,
            total: total,
            shipTo: order.billingDetails?.firstName
              ? `${order.billingDetails.firstName} ${order.billingDetails.lastName || ""}`
              : "N/A",
            status: order.status || "PENDING",
            items: items,
            paymentMethod: order.paymentMethod || "Online",
            shippingDetails,
            logistics,
          }
        })

        setOrders(mappedOrders)

        // Collect all unique actual product IDs for review status checking
        const allProductIds: string[] = []
        mappedOrders.forEach((order) => {
          order.items.forEach((item) => {
            if (item.actualProductId && item.actualProductId !== "" && !allProductIds.includes(item.actualProductId)) {
              allProductIds.push(item.actualProductId)
            }
          })
        })

        console.log("All unique product IDs to check for reviews:", allProductIds)

        if (allProductIds.length > 0) {
          await checkReviewStatuses(allProductIds)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order)
    setIsInvoiceModalOpen(true)
  }

  const handleRateOrder = (order: Order, productId: string, productName: string, productImage: string) => {
    setRatingOrderId(order.originalOrderId || order.id)
    setRatingProductId(productId)
    setRatingProductName(productName)
    setRatingProductImage(productImage)
    setIsRatingModalOpen(true)
  }

  const handleReviewSubmitted = (orderId: string, productId: string, reviewData: any) => {
    setReviewStatuses((prev) => ({
      ...prev,
      [productId]: {
        hasReview: true,
        reviewId: reviewData.reviewId,
        rating: reviewData.rating,
        status: "approved",
        reviewText: reviewData.review,
        createdAt: new Date().toISOString(),
      },
    }))

    setHiddenRatingBanners((prev) => [...prev, productId])
  }

  const extractImageUrl = (product: any): string => {
    const possibleFields = ["image_link", "image", "imageUrl", "img", "thumbnail", "photo"]

    for (const field of possibleFields) {
      if (product[field] && typeof product[field] === "string") {
        return formatImageUrl(product[field])
      }
    }

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return formatImageUrl(product.images[0])
    }

    return "/placeholder.svg"
  }

  const formatImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg"

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }

    if (url.startsWith("/")) {
      return url
    }

    return `/${url}`
  }

  const handleImageError = (itemId: string) => {
    console.log("Image error for item:", itemId)
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }))
  }

  const filteredOrders = useMemo(() => {
    let baseOrders = orders

    if (timeFilter === "all") {
      baseOrders = orders
        .filter((order) => {
          const orderDate = parseISO(order.date)
          return !isNaN(orderDate.getTime())
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      const now = new Date()
      const year = timeFilter === "2024" ? 2024 : timeFilter === "2023" ? 2023 : null

      baseOrders = orders
        .filter((order) => {
          const orderDate = parseISO(order.date)
          if (isNaN(orderDate.getTime())) return false

          if (year) {
            return orderDate.getFullYear() === year
          }

          const months = timeFilter === "past3Months" ? 3 : 6
          const filterDate = new Date()
          filterDate.setMonth(filterDate.getMonth() - months)

          return orderDate >= filterDate && orderDate <= now
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    const expandedOrders: Order[] = []

    baseOrders.forEach((order) => {
      order.items.forEach((item, itemIndex) => {
        const itemTotal = item.price * item.quantity
        const itemTax = (order.tax * itemTotal) / order.subtotal || 0

        expandedOrders.push({
          ...order,
          id: `${order.id}-item-${itemIndex}`,
          originalOrderId: order.id,
          items: [item],
          subtotal: itemTotal,
          tax: itemTax,
          total: itemTotal + itemTax,
          shipTo: order.shipTo,
        })
      })
    })

    return expandedOrders
  }, [timeFilter, orders])

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  useEffect(() => {
    setCurrentPage(1)
  }, [timeFilter, activeTab])

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const hideRatingBanner = (productId: string) => {
    setHiddenRatingBanners((prev) => [...prev, productId])
  }

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const toggleItemsExpand = (orderId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes("delivered")) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Delivered
        </Badge>
      )
    } else if (statusLower.includes("shipped")) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Shipped
        </Badge>
      )
    } else if (statusLower.includes("processing") || statusLower.includes("pending")) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {statusLower.includes("processing") ? "Processing" : "Pending"}
        </Badge>
      )
    } else if (statusLower.includes("cancelled")) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      )
    }

    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
  }

  const getOrderColor = (orderId: string): { header: string; border: string; content: string } => {
    let hash = 0
    for (let i = 0; i < orderId.length; i++) {
      hash = orderId.charCodeAt(i) + ((hash << 5) - hash)
    }

    const isGreen = hash % 2 === 0

    if (isGreen) {
      const intensity = 50 + (hash % 30)
      return {
        header: `rgba(0, 128, 0, 0.${intensity})`,
        border: `rgba(0, 100, 0, 0.8)`,
        content: `rgba(240, 255, 240, 0.6)`,
      }
    } else {
      const intensity = 50 + (hash % 30)
      return {
        header: `rgba(255, 165, 0, 0.${intensity})`,
        border: `rgba(220, 120, 0, 0.8)`,
        content: `rgba(255, 248, 240, 0.6)`,
      }
    }
  }

  const renderProductImage = (item: OrderItem) => {
    if (imageErrors[item.id]) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-md w-[80px] h-[80px]">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )
    }

    return (
      <div className="relative w-[80px] h-[80px] bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
          onError={() => handleImageError(item.id)}
          priority={false}
        />
      </div>
    )
  }

  const renderPagination = () => {
    if (filteredOrders.length <= ordersPerPage) return null

    return (
      <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-600">
          Showing orders {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
          {filteredOrders.length}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="h-9 px-3 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 ${page === currentPage ? "bg-emerald-900 hover:bg-emerald-800" : ""}`}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="h-9 px-3 bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  const renderShippingDetails = (details: ShippingDetails) => (
    <div className="space-y-1 text-sm">
      <div>
        <span className="font-medium">Name:</span> {details.firstName} {details.lastName}
      </div>
      <div>
        <span className="font-medium">Email:</span> {details.email}
      </div>
      <div>
        <span className="font-medium">Address:</span> {details.address}, {details.city}, {details.state}{" "}
        {details.zipCode}, {details.country}
      </div>
    </div>
  )

  const renderLogisticsInfo = (logistics: LogisticsInfo) => (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-emerald-700" />
        <span className="font-medium">Warehouse ID:</span> {logistics.warehouseId}
      </div>

      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-emerald-700" />
        <span className="font-medium">Logistics ID:</span> {logistics.logisticsId}
      </div>

      {logistics.trackingId && (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-emerald-700" />
          <span className="font-medium">Tracking ID:</span> {logistics.trackingId}
        </div>
      )}
    </div>
  )

  const renderReviewSection = (order: Order) => {
    const currentItem = order.items[0]
    const reviewStatus = reviewStatuses[currentItem.actualProductId || ""]

    console.log(`Review status for product ${currentItem.actualProductId}:`, reviewStatus)

    if (reviewStatus?.hasReview) {
      return (
        <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Product already reviewed</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (reviewStatus.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">({reviewStatus.rating}/5)</span>
              </div>
            </div>
          </div>
          {reviewStatus.reviewText && <p className="text-sm text-green-700 mt-2">"{reviewStatus.reviewText}"</p>}
        </div>
      )
    }

    const productIdForBanner = currentItem.actualProductId || ""
    if (productIdForBanner && !hiddenRatingBanners.includes(productIdForBanner)) {
      return (
        <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleRateOrder(order, productIdForBanner, currentItem.name, currentItem.image)}
              className="flex items-center gap-2 text-sm md:text-base hover:text-yellow-700 transition-colors"
            >
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span>How was your experience with this product? Rate it now</span>
            </button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => hideRatingBanner(productIdForBanner)}>
              ×
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Orders</h1>
          <p className="text-gray-600">Track, manage, and review your orders</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList className="bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="orders"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger
                  value="notShipped"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Not Shipped
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Cancelled
                </TabsTrigger>
              </TabsList>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px] bg-white border">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="past3Months">Past 3 Months</SelectItem>
                  <SelectItem value="past6Months">Past 6 Months</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-900"></div>
              </div>
            ) : (
              <>
                <TabsContent value="orders" className="mt-6">
                  {filteredOrders.length > 0 ? (
                    <>
                      <div className="space-y-6">
                        {currentOrders.map((order, index) => {
                          const isExpanded = expandedOrders.includes(order.id)
                          const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
                          const orderColors = getOrderColor(order.originalOrderId || order.id)
                          const orderNumber = indexOfFirstOrder + index + 1
                          const currentItem = order.items[0]

                          return (
                            <Card
                              key={order.id}
                              className="overflow-hidden border-t-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                              style={{ borderTopColor: orderColors.border }}
                            >
                              <CardHeader className="p-4 md:p-6" style={{ background: orderColors.header }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-emerald-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {orderNumber}
                                      </span>
                                      <h3 className="font-medium">
                                        <span className="text-emerald-800">OrderId </span>
                                        <span className="font-bold">{order.originalOrderId || order.id}</span>
                                      </h3>
                                      {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      Placed on {format(parseISO(order.date), "MMMM d, yyyy")}
                                    </p>
                                    {order.originalOrderId && (
                                      <p className="text-xs text-emerald-700 font-medium">
                                        Product from order {order.originalOrderId}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="font-medium">₹{order.total.toFixed(2)}</p>
                                      <p className="text-sm text-gray-700">
                                        {totalItems} {totalItems === 1 ? "item" : "items"}
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 px-2 bg-white/80 hover:bg-white"
                                      onClick={() => toggleOrderExpand(order.id)}
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-5 w-5" />
                                      ) : (
                                        <ChevronDown className="h-5 w-5" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>

                              {isExpanded && (
                                <CardContent
                                  className="p-4 md:p-6 transition-all duration-300"
                                  style={{ background: orderColors.content }}
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                                      <h4 className="font-medium mb-4 flex items-center gap-2 text-emerald-800">
                                        <Package className="h-4 w-4" />
                                        Product Details
                                      </h4>
                                      <div className="space-y-4">
                                        <div className="flex gap-4 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                          <div className="flex-shrink-0">{renderProductImage(currentItem)}</div>
                                          <div className="flex-grow">
                                            <h5 className="font-medium text-sm">{currentItem.name}</h5>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Product ID: {currentItem.actualProductId || "Not Available"}
                                            </p>
                                            <div className="flex justify-between mt-1">
                                              <p className="text-sm text-gray-600">Qty: {currentItem.quantity}</p>
                                              <p className="text-sm font-medium">
                                                ₹{currentItem.price.toFixed(2)} each
                                              </p>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                              <p className="text-sm text-gray-600">Subtotal:</p>
                                              <p className="text-sm font-medium">
                                                ₹{(currentItem.price * currentItem.quantity).toFixed(2)}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                                      <h4 className="font-medium mb-3 text-emerald-800">Shipping Information</h4>
                                      {order.shippingDetails && renderShippingDetails(order.shippingDetails)}

                                      <div className="mt-4">
                                        <h4 className="font-medium mb-3 text-emerald-800">Delivery Details</h4>
                                        {order.logistics && renderLogisticsInfo(order.logistics)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                                      <h4 className="font-medium mb-2 text-emerald-800">Payment Method</h4>
                                      <p className="text-sm mb-2">{order.paymentMethod}</p>
                                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                                    </div>

                                    <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                                      <h4 className="font-medium mb-2 text-emerald-800">Product Summary</h4>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span>Product Total:</span>
                                          <span>₹{order.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Shipping:</span>
                                          <span>₹0.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Tax (proportional):</span>
                                          <span>₹{order.tax.toFixed(2)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-medium">
                                          <span>Total for this product:</span>
                                          <span className="text-emerald-700">
                                            ₹{(order.subtotal + order.tax).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 pt-6">
                                    <Button className="bg-emerald-900 hover:bg-emerald-800">Track Order</Button>
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-1 bg-transparent"
                                      onClick={() => handleViewInvoice(order)}
                                    >
                                      <FileText className="h-4 w-4" />
                                      View Invoice
                                    </Button>
                                    <SendEmailButton orderId={order.originalOrderId || order.id} />
                                  </div>

                                  {renderReviewSection(order)}
                                </CardContent>
                              )}
                            </Card>
                          )
                        })}
                      </div>

                      {renderPagination()}
                    </>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-lg border">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders found</h3>
                      <p className="text-gray-500 mb-6">You haven't placed any orders yet or none match your filter.</p>
                      <Button className="bg-emerald-900 hover:bg-emerald-800">Start Shopping</Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notShipped">
                  <div className="text-center py-16 bg-white rounded-lg border mt-6">
                    <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders in transit</h3>
                    <p className="text-gray-500">
                      All your orders have been delivered or none are currently being shipped.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="cancelled">
                  <div className="text-center py-16 bg-white rounded-lg border mt-6">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cancelled orders</h3>
                    <p className="text-gray-500">You don't have any cancelled orders.</p>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      <InvoiceModal order={selectedOrder} isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false)
          setRatingOrderId("")
          setRatingProductId("")
          setRatingProductName("")
          setRatingProductImage("")
        }}
        orderId={ratingOrderId}
        productId={ratingProductId}
        productName={ratingProductName}
        productImage={ratingProductImage}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  )
}
