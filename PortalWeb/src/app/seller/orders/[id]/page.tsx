"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package, User, MapPin, Calendar, CreditCard } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface OrderProduct {
  productId?: string
  product_id?: string
  title: string
  quantity: number
  price: number
  image_link?: string
}

interface BillingDetails {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface Order {
  _id: string
  userId?: string
  products: OrderProduct[]
  billingDetails: BillingDetails
  totalAmount: number
  sellerSubtotal: number
  originalTotal: number
  status: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setLoading(true)
        const response = await fetch(`/api/seller/orders/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("Failed to load order details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    const statusUpper = (status || "").toUpperCase()
    if (statusUpper === "PENDING") return "bg-yellow-500"
    if (statusUpper === "PROCESSING") return "bg-blue-500"
    if (statusUpper === "SHIPPED") return "bg-purple-500"
    if (statusUpper === "DELIVERED") return "bg-green-500"
    if (statusUpper === "CANCELLED") return "bg-red-500"
    return "bg-gray-500"
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a")
    } catch (e) {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order details...</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">{error || "Order not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/seller/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <Link href="/seller/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <Badge className={getStatusColor(order.status)}>{(order.status || "PENDING").toUpperCase()}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div key={index} className="flex items-center space-x-4 py-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {product.image_link ? (
                      <Image
                        src={product.image_link || "/placeholder.svg"}
                        alt={product.title || "Product"}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.title || "Unnamed Product"}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {product.quantity} × ₹{product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="font-medium">₹{(product.quantity * product.price).toFixed(2)}</div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span>₹{order.sellerSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Original Order Total</span>
                <span>₹{order.originalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.billingDetails.firstName} {order.billingDetails.lastName}
                </p>
                <p className="text-sm">{order.billingDetails.email}</p>
                <p className="text-sm">{order.billingDetails.phone || order.billingDetails.phoneNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>{order.billingDetails.address}</p>
                <p>
                  {order.billingDetails.city}, {order.billingDetails.state} {order.billingDetails.zipCode}
                </p>
                <p>{order.billingDetails.country}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">{order._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Placed</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="flex items-center">
                    <CreditCard className="mr-1 h-3 w-3" />
                    {order.paymentMethod || "Online Payment"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
