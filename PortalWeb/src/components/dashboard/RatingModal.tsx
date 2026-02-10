"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  productId: string
  productName: string
  productImage?: string
  onReviewSubmitted: (orderId: string, productId: string, reviewData: any) => void
}

export function RatingModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
  productImage,
  onReviewSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (review.trim().length < 10) {
      toast.error("Please write at least 10 characters for your review")
      return
    }

    if (review.trim().length > 500) {
      toast.error("Review must be less than 500 characters")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Submitting review with data:", {
        orderId,
        productId,
        productName,
        rating,
        review: review.trim(),
      })

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          productId,
          productName,
          rating,
          review: review.trim(),
        }),
      })

      const data = await response.json()
      console.log("Review submission response:", data)

      if (response.ok) {
        toast.success("Review submitted successfully!")
        onReviewSubmitted(orderId, productId, data.data)
        handleClose()
      } else {
        if (response.status === 409) {
          // Product already reviewed
          toast.error("You have already reviewed this product")
          if (data.existingReview) {
            // Update the UI to show the existing review
            onReviewSubmitted(orderId, productId, {
              reviewId: data.existingReview.id,
              rating: data.existingReview.rating,
              review: data.existingReview.review,
              status: data.existingReview.status,
              productId: data.existingReview.product_id,
            })
          }
        } else {
          toast.error(data.error || "Failed to submit review")
        }
        console.error("Review submission error:", data)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setReview("")
    setIsSubmitting(false)
    onClose()
  }

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Rate this Product</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
              {productImage ? (
                <Image
                  src={productImage || "/placeholder.svg"}
                  alt={productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">{productName}</h3>
              <p className="text-xs text-gray-500">Product ID: {productId}</p>
              <p className="text-xs text-gray-500">Order ID: {orderId}</p>
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              {renderStars()}
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>
          </div>

          {/* Review Text Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Your Review</label>
            <Textarea
              placeholder="Share your experience with this product... (minimum 10 characters)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {review.length < 10 ? `${10 - review.length} more characters needed` : "✓ Minimum length met"}
              </span>
              <span>{review.length}/500</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || review.trim().length < 10 || isSubmitting}
              className="flex-1 bg-emerald-900 hover:bg-emerald-800"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
