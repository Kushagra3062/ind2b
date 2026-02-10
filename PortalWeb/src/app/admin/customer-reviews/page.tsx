"use client"

import { useState } from "react"
import { CustomerReviewsStats } from "@/components/admin/product-reviews/product-reviews-stats"
import { CustomerReviewsTable } from "@/components/admin/product-reviews/product-reviews-table"

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

export default function CustomerReviewsPage() {
  const [statistics, setStatistics] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  })

  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([
    { rating: 1, count: 0 },
    { rating: 2, count: 0 },
    { rating: 3, count: 0 },
    { rating: 4, count: 0 },
    { rating: 5, count: 0 },
  ])

  const handleStatsUpdate = (newStats: ReviewStats, newDistribution: RatingDistribution[]) => {
    setStatistics(newStats)
    setRatingDistribution(newDistribution)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
          <p className="text-muted-foreground">Manage and moderate customer reviews</p>
        </div>
      </div>

      <CustomerReviewsStats statistics={statistics} ratingDistribution={ratingDistribution} />

      <CustomerReviewsTable onStatsUpdate={handleStatsUpdate} />
    </div>
  )
}
