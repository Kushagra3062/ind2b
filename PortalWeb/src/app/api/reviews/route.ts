import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import getReviewModel from "@/models/profile/review"
import type mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting review submission process...")

    // Get the current logged-in user
    const user = await getCurrentUser()
    console.log("Current user:", user ? { id: user.id, email: user.email } : "No user found")

    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log("Request body:", body)

    const { orderId, productId, rating, review, productName } = body

    // Validate required fields
    if (!orderId) {
      console.log("Missing orderId")
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    if (!productId) {
      console.log("Missing productId")
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    if (!productName) {
      console.log("Missing productName")
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    if (!rating) {
      console.log("Missing rating")
      return NextResponse.json({ error: "Rating is required" }, { status: 400 })
    }

    if (!review) {
      console.log("Missing review")
      return NextResponse.json({ error: "Review text is required" }, { status: 400 })
    }

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      console.log("Invalid rating:", rating)
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Validate review length
    const reviewText = review.trim()
    if (reviewText.length < 10 || reviewText.length > 500) {
      console.log("Invalid review length:", reviewText.length)
      return NextResponse.json({ error: "Review must be between 10 and 500 characters" }, { status: 400 })
    }

    console.log("All validations passed, connecting to database...")

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    console.log("Database connected successfully")

    // Clean up old problematic indexes first
    try {
      const collection = connection.db?.collection("reviews")
      if (collection) {
        // Drop all old problematic indexes
        const indexes = await collection.indexes()
        console.log(
          "Current indexes:",
          indexes.map((idx) => idx.name),
        )

        // Drop specific problematic indexes
        const problematicIndexes = ["userId_1_orderId_1", "userId_1_productId_1_orderId_1", "userId_1_product_id_1"]

        for (const indexName of problematicIndexes) {
          try {
            await collection.dropIndex(indexName)
            console.log(`Dropped problematic index: ${indexName}`)
          } catch (dropError: any) {
            console.log(`Index ${indexName} not found or already dropped`)
          }
        }

        // Ensure the correct index exists
        try {
          await collection.createIndex(
            { userId: 1, product_id: 1, orderId: 1 },
            { unique: true, name: "userId_1_product_id_1_orderId_1" },
          )
          console.log("Created correct index: userId_1_product_id_1_orderId_1")
        } catch (indexError: any) {
          console.log("Index creation result:", indexError?.message || "Index already exists")
        }
      }
    } catch (cleanupError: any) {
      console.log("Index cleanup error (continuing):", cleanupError?.message)
    }

    // Get the Review model
    const Review = getReviewModel(connection)
    if (!Review) {
      console.log("Review model not found")
      return NextResponse.json({ error: "Review model not available" }, { status: 500 })
    }

    console.log("Review model found, checking for existing review...")

    // Check if user has already reviewed this specific product in this specific order
    // Logic: Same orderId + same productId = cannot review again
    // Logic: Same orderId + different productId = can review
    // Logic: Different orderId + same productId = can review
    const existingReview = await Review.findOne({
      userId: user.id,
      product_id: productId,
      orderId: orderId,
    })

    console.log("Existing review check result:", existingReview ? "Found existing review" : "No existing review")

    if (existingReview) {
      console.log("User has already reviewed this product in this order:", {
        reviewId: (existingReview._id as mongoose.Types.ObjectId).toString(),
        product_id: existingReview.product_id,
        orderId: existingReview.orderId,
        title: existingReview.title,
        rating: existingReview.rating,
        status: existingReview.status,
      })
      return NextResponse.json(
        {
          error: "You have already reviewed this product in this order",
          message:
            "You can review other products in this order or review this product if you purchase it again in a different order.",
          existingReview: {
            id: (existingReview._id as mongoose.Types.ObjectId).toString(),
            product_id: existingReview.product_id,
            orderId: existingReview.orderId,
            title: existingReview.title,
            rating: existingReview.rating,
            review: existingReview.review,
            status: existingReview.status,
            createdAt: existingReview.createdAt,
          },
        },
        { status: 409 },
      )
    }

    console.log("No existing review found for this product in this order, creating new review...")

    // Create the review for this specific product in this specific order
    // Save to PROFILE_DB in reviews collection with product_id attribute
    const reviewData = {
      userId: user.id,
      orderId: orderId,
      product_id: productId, // This is the productId attribute that will be saved
      title: productName,
      rating: rating,
      review: reviewText,
      status: "approved" as const,
      isVerifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Creating review with data:", {
      userId: reviewData.userId,
      orderId: reviewData.orderId,
      product_id: reviewData.product_id,
      title: reviewData.title,
      rating: reviewData.rating,
      review: `${reviewData.review.substring(0, 50)}...`,
      status: reviewData.status,
    })

    try {
      const newReview = new Review(reviewData)
      const savedReview = await newReview.save()

      console.log("Review saved successfully to PROFILE_DB reviews collection:", {
        id: (savedReview._id as mongoose.Types.ObjectId).toString(),
        product_id: savedReview.product_id,
        orderId: savedReview.orderId,
        title: savedReview.title,
        rating: savedReview.rating,
        status: savedReview.status,
      })

      return NextResponse.json(
        {
          success: true,
          message: "Review submitted and approved successfully",
          reviewId: (savedReview._id as mongoose.Types.ObjectId).toString(),
          data: {
            id: (savedReview._id as mongoose.Types.ObjectId).toString(),
            userId: savedReview.userId,
            orderId: savedReview.orderId,
            product_id: savedReview.product_id,
            title: savedReview.title,
            rating: savedReview.rating,
            review: savedReview.review,
            status: savedReview.status,
            createdAt: savedReview.createdAt,
          },
        },
        { status: 201 },
      )
    } catch (saveError: any) {
      console.error("Error saving review to PROFILE_DB:", saveError)

      // Handle MongoDB duplicate key error specifically
      if (saveError instanceof Error && saveError.message.includes("E11000")) {
        console.log("Duplicate key error - user already reviewed this product in this order")
        return NextResponse.json(
          {
            error: "You have already reviewed this product in this order",
            message:
              "You can review other products in this order or review this product if you purchase it again in a different order.",
          },
          { status: 409 },
        )
      }

      if (saveError instanceof Error && saveError.message.includes("validation")) {
        console.log("Validation error:", saveError.message)
        return NextResponse.json({ error: "Invalid data provided", details: saveError.message }, { status: 400 })
      }

      return NextResponse.json(
        {
          error: "Failed to save review to database",
          details: saveError instanceof Error ? saveError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error submitting review:", error)

    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key") || error.message.includes("E11000")) {
        console.log("Duplicate key error - user already reviewed this product in this order")
        return NextResponse.json(
          {
            error: "You have already reviewed this product in this order",
            message:
              "You can review other products in this order or review this product if you purchase it again in a different order.",
          },
          { status: 409 },
        )
      }

      if (error.message.includes("validation")) {
        console.log("Validation error:", error.message)
        return NextResponse.json({ error: "Invalid data provided", details: error.message }, { status: 400 })
      }

      if (error.message.includes("Cast to ObjectId failed")) {
        console.log("Invalid ObjectId format")
        return NextResponse.json({ error: "Invalid order or product ID format" }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: "Failed to submit review",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "approved"

    console.log("GET reviews request:", { orderId, productId, userId, page, limit, status })

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    const Review = getReviewModel(connection)

    if (!Review) {
      return NextResponse.json({ error: "Review model not available" }, { status: 500 })
    }

    const query: Record<string, any> = {}

    // Build query based on parameters
    if (status && status !== "all") {
      query.status = status
    }

    if (orderId) {
      query.orderId = orderId
    }

    if (productId) {
      query.product_id = productId
    }

    if (userId) {
      if (userId === "current") {
        // Get current user for checking their reviews
        const user = await getCurrentUser()
        if (user) {
          query.userId = user.id
          // Remove status filter to show all user's reviews regardless of status
          delete query.status
        } else {
          return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
        }
      } else {
        query.userId = userId
        // Remove status filter to show all user's reviews regardless of status
        delete query.status
      }
    }

    // If no specific user is requested, only show approved reviews by default
    if (!userId && (!status || status === "approved")) {
      query.status = "approved"
    }

    console.log("Query for PROFILE_DB reviews collection:", query)

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ])

    console.log(`Found ${reviews.length} reviews out of ${total} total in PROFILE_DB`)

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
        ...review,
        _id: (review._id as mongoose.Types.ObjectId).toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching reviews from PROFILE_DB:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
