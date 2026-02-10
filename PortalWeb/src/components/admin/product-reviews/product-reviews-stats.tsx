"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, MessageSquare, CheckCircle, Clock } from "lucide-react"

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

interface CustomerReviewsStatsProps {
  statistics: ReviewStats
  ratingDistribution: RatingDistribution[]
}

export function CustomerReviewsStats({ statistics, ratingDistribution }: CustomerReviewsStatsProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getProgressPercentage = (count: number) => {
    return statistics.totalReviews > 0 ? (count / statistics.totalReviews) * 100 : 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalReviews}</div>
          <p className="text-xs text-muted-foreground">All customer reviews</p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{statistics.averageRating}</div>
            {renderStars(Math.round(statistics.averageRating))}
          </div>
          <p className="text-xs text-muted-foreground">Out of 5 stars</p>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{statistics.pendingCount}</div>
          <p className="text-xs text-muted-foreground">Awaiting moderation</p>
        </CardContent>
      </Card>

      {/* Approved Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Reviews</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{statistics.approvedCount}</div>
          <p className="text-xs text-muted-foreground">Published reviews</p>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution
              .slice()
              .reverse()
              .map((item) => (
                <div key={item.rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{item.rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <Progress value={getProgressPercentage(item.count)} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground w-12 text-right">{item.count}</div>
                  <div className="text-xs text-muted-foreground w-12 text-right">
                    ({getProgressPercentage(item.count).toFixed(1)}%)
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
