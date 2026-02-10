"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getOrders, getOrderStatuses } from "@/actions/admin-orders"

export default function OrdersTable() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [orders, setOrders] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<string[]>([])

  useEffect(() => {
    const fetchOrderStatuses = async () => {
      try {
        const statusList = await getOrderStatuses()
        setStatuses(statusList)
      } catch (error) {
        console.error("Error fetching order statuses:", error)
      }
    }

    fetchOrderStatuses()
  }, [])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const result = await getOrders(currentPage, dateFilter, statusFilter)

        setOrders(result.orders)
        setTotalPages(result.totalPages)

        // If current page is greater than total pages, reset to page 1
        if (currentPage > result.totalPages && result.totalPages > 0) {
          setCurrentPage(1)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Set up polling for real-time updates (every 15 seconds)
    const interval = setInterval(fetchOrders, 15000)

    return () => clearInterval(interval)
  }, [currentPage, dateFilter, statusFilter])

  const handleRowClick = (orderId: string) => {
    router.push(`/admin/order/${orderId}`)
  }

  const handleReset = () => {
    setDateFilter("all")
    setStatusFilter("all")
    setSearchQuery("")
    setCurrentPage(1)
  }

  // Filter orders based on search query
  const filteredOrders = searchQuery
    ? orders.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.seller.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : orders

  // Generate date range options
  const dateRanges = [
    { value: "all", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold">List of Orders</h2>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-end w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Reset Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>BUYER NAME</TableHead>
                <TableHead>SELLER NAME</TableHead>
                <TableHead>ORDER DATE</TableHead>
                <TableHead>TOTAL ORDER</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>PAYMENT STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <TableCell key={`cell-${cellIndex}`}>
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(order.id)}
                  >
                    <TableCell className="font-medium">{order.id.slice(-5)}</TableCell>
                    <TableCell>{order.buyer}</TableCell>
                    <TableCell>{order.seller}</TableCell>
                    <TableCell>{order.displayDate}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.payment === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.payment}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0 || loading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
