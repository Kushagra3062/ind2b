"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Star, MoreHorizontal, Check, X, Clock, Filter, ChevronDown, User, Package } from "lucide-react"
import { format } from "date-fns"

interface Review {
  _id: string
  orderId: string
  userId: string
  rating: number
  review: string
  orderItems: Array<{
    id: string
    name: string
    image_link?: string
  }>
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

interface RatingDistribution {
  rating: number
  count: number
}

interface CustomerReviewsTableProps {
  onStatsUpdate?: (stats: ReviewStats, distribution: RatingDistribution[]) => void
}

export function CustomerReviewsTable({ onStatsUpdate }: CustomerReviewsTableProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [expandedReview, setExpandedReview] = useState<string | null>(null)
  const { toast } = useToast()

  const reviewsPerPage = 10

  useEffect(() => {
    fetchReviews()
  }, [currentPage, statusFilter, ratingFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      queryParams.append("page", currentPage.toString())
      queryParams.append("limit", reviewsPerPage.toString())

      if (statusFilter) {
        queryParams.append("status", statusFilter)
      }

      if (ratingFilter) {
        queryParams.append("rating", ratingFilter.toString())
      }

      console.log("Fetching reviews with params:", queryParams.toString())

      const response = await fetch(`/api/admin/customer-reviews?${queryParams.toString()}`)
      const data = await response.json()

      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to fetch reviews")
      }

      if (data.success) {
        setReviews(data.reviews || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)

        // Update parent component with stats
        if (onStatsUpdate && data.statistics && data.ratingDistribution) {
          onStatsUpdate(data.statistics, data.ratingDistribution)
        }
      } else {
        throw new Error(data.error || "Failed to fetch reviews")
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError(err instanceof Error ? err.message : "Error fetching reviews. Please try again.")
      setReviews([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reviewId: string, newStatus: "approved" | "rejected") => {
    try {
      setUpdatingStatus(reviewId)

      const response = await fetch("/api/admin/customer-reviews/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to update status")
      }

      if (data.success) {
        setReviews((prevReviews) =>
          prevReviews.map((review) => (review._id === reviewId ? { ...review, status: newStatus } : review)),
        )

        toast({
          title: "Status Updated",
          description: `Review status changed to ${newStatus}`,
        })

        // Refresh data to update stats
        fetchReviews()
      } else {
        throw new Error(data.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update review status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "pending":
      default:
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-3 w-3" />
      case "rejected":
        return <X className="h-3 w-3" />
      case "pending":
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  const resetFilters = () => {
    setStatusFilter(null)
    setRatingFilter(null)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchReviews} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Reviews Management</h2>
              <p className="text-sm text-gray-600">Total: {total} reviews</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {statusFilter || "All Status"} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setStatusFilter(null)
                      setCurrentPage(1)
                    }}
                  >
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setStatusFilter("pending")
                      setCurrentPage(1)
                    }}
                  >
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setStatusFilter("approved")
                      setCurrentPage(1)
                    }}
                  >
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setStatusFilter("rejected")
                      setCurrentPage(1)
                    }}
                  >
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {ratingFilter ? `${ratingFilter} Stars` : "All Ratings"} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setRatingFilter(null)
                      setCurrentPage(1)
                    }}
                  >
                    All Ratings
                  </DropdownMenuItem>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <DropdownMenuItem
                      key={rating}
                      onClick={() => {
                        setRatingFilter(rating)
                        setCurrentPage(1)
                      }}
                    >
                      {rating} Stars
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 hover:text-red-700">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              {statusFilter || ratingFilter ? "No reviews found with current filters" : "No reviews found"}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">User ID: {review.userId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Order ID: {review.orderId}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(review.createdAt), "MMM dd, yyyy HH:mm")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(review.status)}>
                        {getStatusIcon(review.status)}
                        <span className="ml-1 capitalize">{review.status}</span>
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={updatingStatus === review._id}>
                            {updatingStatus === review._id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(review._id, "approved")}
                            className="text-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(review._id, "rejected")}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>{renderStars(review.rating)}</div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <div
                      className={`text-gray-700 ${expandedReview !== review._id && review.review.length > 200 ? "line-clamp-3" : ""}`}
                    >
                      {review.review}
                    </div>
                    {review.review.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedReview(expandedReview === review._id ? null : review._id)}
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                      >
                        {expandedReview === review._id ? "Show less" : "Show more"}
                      </Button>
                    )}
                  </div>

                  {/* Order Items */}
                  {review.orderItems && review.orderItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Reviewed Products:</h4>
                      <div className="flex flex-wrap gap-2">
                        {review.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                            <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={item.image_link || "/placeholder.svg?height=32&width=32"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=32&width=32"
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 truncate max-w-[120px]">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({total} total reviews)
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
