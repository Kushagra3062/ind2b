"use client"

import { useState, useEffect, useCallback } from "react"
import StatsSection from "../order/StatsSection"
import ChartsSection from "../order/ChartsSection"
import { OrderFilters } from "./order-filters"
import { OrdersTable } from "./orders-table"
import { OrderDetailModal } from "./order-detail-modal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Define the OrderDocument interface locally to avoid import issues
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

export function OrderManagerDashboard() {
  const [orders, setOrders] = useState<OrderDocument[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderDocument | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL_STATUSES")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Fetch orders - wrapped in useCallback to prevent infinite loops
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()

      // Log the data to see what we're getting
      console.log("Fetched orders:", data.length)

      setOrders(data)

      // Apply current filters to the new data
      applyFilters(data, activeTab, searchTerm, statusFilter, dateRange)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm, statusFilter, dateRange])

  // Apply filters - extracted to a separate function to avoid duplication
  const applyFilters = useCallback(
    (orderData: OrderDocument[], tab: string, search: string, status: string, dates: { from?: Date; to?: Date }) => {
      let result = [...orderData]

      // Apply tab filter
      if (tab !== "all") {
        result = result.filter((order) => order.status?.toUpperCase() === tab.toUpperCase())
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase()
        result = result.filter(
          (order) =>
            order._id?.toString().toLowerCase().includes(searchLower) ||
            order.billingDetails?.firstName?.toLowerCase().includes(searchLower) ||
            order.billingDetails?.lastName?.toLowerCase().includes(searchLower) ||
            order.billingDetails?.email?.toLowerCase().includes(searchLower) ||
            order.products?.some((p) => p.title?.toLowerCase().includes(searchLower)),
        )
      }

      // Apply status filter
      if (status !== "ALL_STATUSES") {
        result = result.filter((order) => order.status?.toUpperCase() === status.toUpperCase())
      }

      // Apply date range filter
      if (dates.from) {
        result = result.filter((order) => new Date(order.createdAt || new Date()) >= dates.from!)
      }

      if (dates.to) {
        const endDate = new Date(dates.to)
        endDate.setDate(endDate.getDate() + 1)
        result = result.filter((order) => new Date(order.createdAt || new Date()) < endDate)
      }

      // Log the filtered results
      console.log("Filtered orders:", result.length)

      setFilteredOrders(result)
    },
    [],
  )

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders().finally(() => {
      setRefreshing(false)
      toast.success("Orders refreshed")
    })
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    applyFilters(orders, value, searchTerm, statusFilter, dateRange)
  }

  // Handle search and filter changes
  useEffect(() => {
    applyFilters(orders, activeTab, searchTerm, statusFilter, dateRange)
  }, [orders, activeTab, searchTerm, statusFilter, dateRange, applyFilters])

  // Handle view order details
  const handleViewOrder = (order: OrderDocument) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  // Handle order status update
  const handleOrderStatusUpdate = async () => {
    await fetchOrders()
    setIsDetailModalOpen(false)
    toast.success("Order status updated successfully")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold"></h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Keep original Stats and Charts sections */}
      <StatsSection />
      <ChartsSection dateRange={dateRange} statusFilter={statusFilter} />

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
          <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <OrdersTable orders={filteredOrders} loading={loading} onViewOrder={handleViewOrder} />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </div>
  )
}
