"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
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

interface OrdersTableProps {
  orders: OrderDocument[]
  loading: boolean
  onViewOrder: (order: OrderDocument) => void
}

export function OrdersTable({ orders, loading, onViewOrder }: OrdersTableProps) {
  // For pagination
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Update total pages when orders change
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(orders.length / rowsPerPage)))
    // Reset to page 1 if we're beyond the new total pages
    if (page > Math.max(1, Math.ceil(orders.length / rowsPerPage))) {
      setPage(1)
    }
  }, [orders, rowsPerPage, page])

  // Get current page data
  const startIndex = (page - 1) * rowsPerPage
  const currentOrders = orders.slice(startIndex, startIndex + rowsPerPage)

  // Format date
  const formatDate = (dateString: string | Date | undefined) => {
    try {
      if (!dateString) return "N/A"
      return format(new Date(dateString), "MMM dd, yyyy")
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

  // Get status badge color
  const getStatusColor = (status: string | undefined) => {
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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value))
    setPage(1) // Reset to first page when changing rows per page
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-9 w-9 rounded-md mx-auto" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // No orders found
  if (orders.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No orders found</h3>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentOrders.map((order) => (
            <TableRow key={order._id?.toString()}>
              <TableCell className="font-medium">
                {typeof order._id === "string" ? order._id.substring(0, 8) : order._id?.toString().substring(0, 8)}...
              </TableCell>
              <TableCell>{formatDate(order.createdAt || new Date())}</TableCell>
              <TableCell>
                {order.billingDetails?.firstName || ""} {order.billingDetails?.lastName || ""}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getStatusColor(order.status)} text-white border-0`}>
                  {order.status || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" onClick={() => onViewOrder(order)} title="View Order Details">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-6">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, orders.length)} of {orders.length}
          </span>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            <div className="text-sm">
              Page {page} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
