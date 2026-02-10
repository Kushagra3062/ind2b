"use client"

import { useState, useEffect } from "react"
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface RecentSeller {
  id: string
  sellerId: string
  sellerName: string
  gstin: string
  registeredDate: string | Date
  businessEntityType?: string
  state?: string
  city?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function RecentSellersTable() {
  const [sellers, setSellers] = useState<RecentSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "N/A"
    }
  }

  // Fetch sellers data with pagination
  const fetchSellers = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/recent-sellers?page=${page}&limit=5`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch sellers")
      }

      if (result.success && result.data) {
        setSellers(result.data)
        setPagination(result.pagination)
        setLastUpdated(new Date())
        console.log("Sellers data updated:", result.data.length, "sellers on page", page)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error fetching sellers:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch sellers")
      toast.error("Failed to fetch recent sellers")
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchSellers(1)
  }, [])

  // Auto-refresh every 5 minutes (only current page)
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchSellers(pagination.currentPage)
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [pagination.currentPage])

  // Manual refresh handler
  const handleRefresh = () => {
    fetchSellers(pagination.currentPage)
    toast.success("Refreshing sellers data...")
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchSellers(pagination.currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchSellers(pagination.currentPage - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePageClick = (page: number) => {
    fetchSellers(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="border-t">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
        </tr>
      ))}
    </div>
  )

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Recently Added Sellers</h3>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Seller ID</th>
              <th className="px-4 py-3">Seller Name</th>
              <th className="px-4 py-3 hidden sm:table-cell">GSTIN</th>
              <th className="px-4 py-3 hidden md:table-cell">Register Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-red-500">
                  <div className="flex flex-col items-center gap-2">
                    <p>Error: {error}</p>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      Try Again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <p>No sellers found</p>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      Refresh
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              sellers.map((seller, index) => (
                <tr key={seller.id || index} className="border-t bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{seller.sellerId}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{seller.sellerName}</div>
                      {seller.businessEntityType && (
                        <div className="text-xs text-gray-500">{seller.businessEntityType}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{seller.gstin}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{formatDate(seller.registeredDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalCount > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount}{" "}
            sellers
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage || loading}
              className="flex items-center gap-1 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(pageNum)}
                  disabled={loading}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || loading}
              className="flex items-center gap-1 bg-transparent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
