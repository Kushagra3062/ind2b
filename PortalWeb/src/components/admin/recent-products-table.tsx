"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  image: string
  sellerName: string
  dateTime: string | Date
  price: number
  stock: number
  status: "Pending" | "Approved" | "Flagged"
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalProducts: number
  hasNext: boolean
  hasPrevious: boolean
  limit: number
}

const statusStyles = {
  Approved: "bg-emerald-100 text-emerald-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Flagged: "bg-red-100 text-red-800",
}

export function RecentProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrevious: false,
    limit: 5,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecentProducts = async (page = 1, showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      const response = await fetch(`/api/admin/recent-products?page=${page}&limit=5`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
        setPagination(result.pagination)
        if (showRefreshToast) {
          toast.success("Recent products refreshed successfully!")
        }
      } else {
        console.error("Failed to fetch recent products:", result.error)
        toast.error("Failed to fetch recent products")
      }
    } catch (error) {
      console.error("Error fetching recent products:", error)
      toast.error("Error fetching recent products")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchRecentProducts(1)
  }, [])

  // Auto-refresh every 2 minutes (only current page)
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchRecentProducts(pagination.currentPage)
      },
      2 * 60 * 1000, // 2 minutes
    )

    return () => clearInterval(interval)
  }, [pagination.currentPage])

  const handleRefresh = () => {
    fetchRecentProducts(pagination.currentPage, true)
  }

  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchRecentProducts(pagination.currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (pagination.hasPrevious) {
      fetchRecentProducts(pagination.currentPage - 1)
    }
  }

  const handlePageClick = (pageNumber: number) => {
    if (pageNumber !== pagination.currentPage) {
      fetchRecentProducts(pageNumber)
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const formatDateTime = (dateTime: string | Date): string => {
    const date = new Date(dateTime)
    return (
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " - " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    )
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-4 font-semibold flex items-center justify-between">
          Recently Added Products
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 font-semibold flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Recently Added Products</span>
          <span className="text-sm font-normal text-gray-500">({pagination.totalProducts} total)</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 hidden sm:table-cell">Seller Name</th>
              <th className="px-4 py-3 hidden md:table-cell">Date - Time</th>
              <th className="px-4 py-3 hidden lg:table-cell">Stock</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No recent products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t bg-white hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=40&width=40"
                        }}
                      />
                      <span className="font-medium line-clamp-2">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{product.sellerName}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{formatDateTime(product.dateTime)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{product.stock}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusStyles[product.status]}>{product.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPrevious || refreshing}
              className="flex items-center gap-1 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(page as number)}
                  disabled={refreshing}
                  className={
                    page === pagination.currentPage
                      ? "bg-black text-white hover:bg-black font-semibold min-w-9"
                      : "min-w-9"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNext || refreshing}
              className="flex items-center gap-1 bg-transparent"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
