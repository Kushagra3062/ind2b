import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define Review schema
const reviewSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  orderItems: [
    {
      id: String,
      name: String,
      image_link: String,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Add indexes for efficient querying
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ rating: 1 })
reviewSchema.index({ status: 1, createdAt: -1 })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const rating = searchParams.get("rating")

    console.log("Admin Reviews API - Request params:", { page, limit, status, rating })

    // Connect to the database
    const connection = await connectProfileDB()
    console.log("Database connection established")

    // Get or create Review model
    let Review
    if (connection.models.Review) {
      Review = connection.models.Review
      console.log("Using existing Review model")
    } else {
      Review = connection.model("Review", reviewSchema)
      console.log("Created new Review model")
    }

    // Build filter query
    const filter: any = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (rating && rating !== "all") {
      filter.rating = Number.parseInt(rating)
    }

    console.log("Filter applied:", filter)

    // Get total count for pagination
    const total = await Review.countDocuments(filter)
    console.log("Total reviews found:", total)

    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    console.log("Reviews fetched:", reviews.length)

    // Get statistics for all reviews (not filtered)
    const allReviewsStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
    ])

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const statistics = allReviewsStats[0] || {
      totalReviews: 0,
      averageRating: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    }

    // Format rating distribution
    const formattedRatingDistribution = [1, 2, 3, 4, 5].map((rating) => {
      const found = ratingDistribution.find((item) => item._id === rating)
      return {
        rating,
        count: found ? found.count : 0,
      }
    })

    console.log("Statistics:", statistics)
    console.log("Rating distribution:", formattedRatingDistribution)

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
        ...review,
        _id: review._id.toString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statistics: {
        ...statistics,
        averageRating: Number((statistics.averageRating || 0).toFixed(1)),
      },
      ratingDistribution: formattedRatingDistribution,
    })
  } catch (error) {
    console.error("Error fetching customer reviews:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer reviews",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
