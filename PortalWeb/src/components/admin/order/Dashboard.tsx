"use client"

import { useState, useEffect } from "react"
import StatsSection from "./StatsSection"
import ChartsSection from "./ChartsSection"
import { OrderFilters } from "@/components/admin/order-manager/order-filters"
import { OrdersTable } from "@/components/admin/order-manager/orders-table"
import { OrderDetailModal } from "@/components/admin/order-manager/order-detail-modal"

// Local OrderDocument interface to match order-manager components
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

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [orders, setOrders] = useState<OrderDocument[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderDocument[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDocument | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL_STATUSES")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  useEffect(() => {
    // Update the last updated time every 15 seconds
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, statusFilter, dateRange])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/orders")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((order) => {
        const orderId = typeof order._id === "string" ? order._id : order._id?.toString() || ""
        const customerName =
          `${order.billingDetails?.firstName || ""} ${order.billingDetails?.lastName || ""}`.toLowerCase()
        const customerEmail = order.billingDetails?.email?.toLowerCase() || ""

        return (
          orderId.toLowerCase().includes(searchLower) ||
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower)
        )
      })
    }

    // Apply status filter
    if (statusFilter !== "ALL_STATUSES") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Apply date range filter
    if (dateRange.from) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt || "")
        return orderDate >= dateRange.from!
      })
    }
    if (dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt || "")
        return orderDate <= dateRange.to!
      })
    }

    setFilteredOrders(filtered)
  }

  const handleViewOrder = (order: OrderDocument) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async () => {
    // Refresh orders after status update
    await fetchOrders()
    setLastUpdated(new Date())
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Dashboard</h1>
        <div className="text-sm text-muted-foreground flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <span>Real-time data • Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Keep original Stats and Charts sections */}
      <StatsSection />
      <ChartsSection />

      {/* Use order-manager filters */}
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Use order-manager table */}
      <OrdersTable orders={filteredOrders} loading={loading} onViewOrder={handleViewOrder} />

      {/* Use order-manager modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedOrder(null)
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
