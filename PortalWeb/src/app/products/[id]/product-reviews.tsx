"use client"

import { useState } from "react"

interface Review {
  _id: string
  userId: string
  orderId: string
  product_id: string
  title: string
  rating: number
  review: string
  status: string
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProductReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export default function ProductReviews({ reviews, averageRating, totalReviews }: ProductReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null)

  // Filter reviews based on selected rating
  const filteredReviews = selectedRatingFilter
    ? reviews.filter((review) => review.rating === selectedRatingFilter)
    : reviews

  // Show only first 3 reviews initially
  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className={`${starSize} ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (totalReviews === 0) {
    return (
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to review this product!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Reviews Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Overall Rating */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
            <div className="flex justify-center mb-2">{renderStars(Math.floor(averageRating), "md")}</div>
            <p className="text-gray-600">Based on {totalReviews} reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRatingFilter(selectedRatingFilter === rating ? null : rating)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                  selectedRatingFilter === rating ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                }`}
              >
                <span>{rating}</span>
                <svg className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Info */}
      {selectedRatingFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {selectedRatingFilter}-star reviews ({filteredReviews.length})
          </span>
          <button onClick={() => setSelectedRatingFilter(null)} className="text-sm text-blue-600 hover:text-blue-800">
            Clear filter
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">{formatDate(review.createdAt)}</span>
                  {review.isVerifiedPurchase && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900">{review.title}</h4>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.review}</p>
            <div className="mt-3 text-sm text-gray-500">Order ID: {review.orderId}</div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {filteredReviews.length > 3 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAllReviews ? "Show Less Reviews" : `Show All ${filteredReviews.length} Reviews`}
          </button>
        </div>
      )}
    </div>
  )
}
