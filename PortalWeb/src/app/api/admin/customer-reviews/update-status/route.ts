import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define Review schema (same as in the main route)
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

export async function PUT(request: NextRequest) {
  try {
    const { reviewId, status } = await request.json()

    console.log("Update review status request:", { reviewId, status })

    // Validate input
    if (!reviewId || !status) {
      return NextResponse.json({ error: "Missing reviewId or status" }, { status: 400 })
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID format" }, { status: 400 })
    }

    // Connect to the database
    const connection = await connectProfileDB()

    // Get or create Review model
    let Review
    if (connection.models.Review) {
      Review = connection.models.Review
    } else {
      Review = connection.model("Review", reviewSchema)
    }

    // Update the review status
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        status: status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    console.log("Review status updated successfully:", updatedReview._id)

    return NextResponse.json({
      success: true,
      message: "Review status updated successfully",
      review: {
        ...updatedReview.toObject(),
        _id: updatedReview._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error updating review status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update review status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
