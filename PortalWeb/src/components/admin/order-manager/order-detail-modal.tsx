"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"

// Local OrderDocument interface to avoid import issues
interface OrderDocument {
  _id: string | { toString(): string }
  userId?: string
  products?: Array<{
    productId?: string
    product_id?: string
    seller_id?: string
    title?: string
    quantity?: number
    price?: number
    image?: string
    image_link?: string
    variant?: string
  }>
  billingDetails?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    phoneNumber?: string
    address?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zipCode?: string
    postalCode?: string
    country?: string
  }
  shippingDetails?: {
    address?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zipCode?: string
    postalCode?: string
    country?: string
  }
  totalAmount?: number
  subtotal?: number
  shippingCost?: number
  taxAmount?: number
  status?: string
  paymentMethod?: string
  paymentStatus?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  [key: string]: any
}

interface OrderDetailModalProps {
  order: OrderDocument
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export function OrderDetailModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailModalProps) {
  const [status, setStatus] = useState(order.status || "")
  const [updating, setUpdating] = useState(false)

  console.log("[v0] Order object:", order)
  console.log("[v0] Billing details:", order.billingDetails)
  console.log("[v0] Phone field:", order.billingDetails?.phone)
  console.log("[v0] PhoneNumber field:", order.billingDetails?.phoneNumber)

  // Helper function to safely access nested properties
  const getNestedProperty = (obj: any, path: string, defaultValue: any = "") => {
    if (!obj) return defaultValue
    return path.split(".").reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : defaultValue
    }, obj)
  }

  // Helper function to get phone number from either field
  const getPhoneNumber = (billingDetails: any) => {
    if (!billingDetails) return "N/A"
    // Check phoneNumber first, then phone, then fallback to N/A
    return billingDetails.phoneNumber || billingDetails.phone || "N/A"
  }

  // Format date
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "PPP p")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Update order status
  const updateOrderStatus = async () => {
    if (status === order.status) {
      toast.info("Status unchanged")
      return
    }

    try {
      setUpdating(true)

      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast.success(`Order status updated to ${status}`)
      onStatusUpdate()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Order Details
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              #{typeof order._id === "string" ? order._id : order._id?.toString()}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="customer">Customer Info</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Order Details Tab */}
          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Order Date</h3>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Order Status</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`${getStatusColor(order.status)} text-white border-0`}>
                    {order.status || "Unknown"}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Payment Method</h3>
                <p>{order.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Payment Status</h3>
                <p>{order.paymentStatus || "N/A"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Order Summary</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getNestedProperty(order, "subtotal", 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(getNestedProperty(order, "shippingCost", 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(getNestedProperty(order, "taxAmount", 0))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Update Status</h3>
              <div className="flex space-x-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={updateOrderStatus} disabled={updating || status === order.status}>
                  {updating ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Customer Info Tab */}
          <TabsContent value="customer" className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p>
                    {getNestedProperty(order, "billingDetails.firstName", "")}{" "}
                    {getNestedProperty(order, "billingDetails.lastName", "")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{getNestedProperty(order, "billingDetails.email", "N/A")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{getNestedProperty(order,"billingDetails.phoneNumber","")}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Billing Address</h3>
              <p>
                {getNestedProperty(order, "billingDetails.address", "")}{" "}
                {getNestedProperty(order, "billingDetails.address1", "")}
                {getNestedProperty(order, "billingDetails.address2") && (
                  <>, {getNestedProperty(order, "billingDetails.address2")}</>
                )}
              </p>
              <p>
                {getNestedProperty(order, "billingDetails.city", "")}
                {getNestedProperty(order, "billingDetails.city") &&
                  getNestedProperty(order, "billingDetails.state") &&
                  ", "}
                {getNestedProperty(order, "billingDetails.state", "")}
              </p>
              <p>
                {getNestedProperty(order, "billingDetails.zipCode", "") ||
                  getNestedProperty(order, "billingDetails.postalCode", "")}
              </p>
              <p>{getNestedProperty(order, "billingDetails.country", "")}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
              {order.shippingDetails ? (
                <>
                  <p>
                    {getNestedProperty(order, "shippingDetails.address", "") ||
                      getNestedProperty(order, "shippingDetails.address1", "")}
                    {getNestedProperty(order, "shippingDetails.address2") && (
                      <>, {getNestedProperty(order, "shippingDetails.address2")}</>
                    )}
                  </p>
                  <p>
                    {getNestedProperty(order, "shippingDetails.city", "")}
                    {getNestedProperty(order, "shippingDetails.city") &&
                      getNestedProperty(order, "shippingDetails.state") &&
                      ", "}
                    {getNestedProperty(order, "shippingDetails.state", "")}
                  </p>
                  <p>
                    {getNestedProperty(order, "shippingDetails.zipCode", "") ||
                      getNestedProperty(order, "shippingDetails.postalCode", "")}
                  </p>
                  <p>{getNestedProperty(order, "shippingDetails.country", "")}</p>
                </>
              ) : (
                <p>Same as billing address</p>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="pt-4">
            {order.products && order.products.length > 0 ? (
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-md">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image || product.image_link ? (
                        <img
                          src={product.image || product.image_link || "/placeholder.svg"}
                          alt={product.title || "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{product.title || "Unnamed Product"}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {product.quantity || 1}</p>
                      {product.variant && <p className="text-sm text-muted-foreground">Variant: {product.variant}</p>}
                      {product.seller_id && (
                        <p className="text-sm text-muted-foreground">Seller ID: {product.seller_id}</p>
                      )}
                      {(product.product_id || product.productId) && (
                        <p className="text-sm text-muted-foreground">
                          Product ID: {product.product_id || product.productId}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.price)}</p>
                      {product.quantity && product.price && (
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(product.quantity * product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No product information available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function for status badge color
function getStatusColor(status: string | undefined) {
  if (!status) return "bg-gray-500"

  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-500"
    case "PROCESSING":
      return "bg-blue-500"
    case "SHIPPED":
      return "bg-purple-500"
    case "DELIVERED":
      return "bg-green-500"
    case "CANCELLED":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}
