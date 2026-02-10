import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { getCurrentUser } from "@/actions/auth"

// Helper function to get seller email from contacts
async function getSellerEmail(connection: mongoose.Connection) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      console.log("No user ID found in session")
      return null
    }

    if (!connection.models.Contact) {
      const ContactSchema = new mongoose.Schema(
        {
          userId: { type: String, required: true, index: true },
          contactName: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          emailId: { type: String, required: true },
          pickupTime: { type: String, required: true },
        },
        { timestamps: true },
      )

      connection.model("Contact", ContactSchema)
    }

    const Contact = connection.models.Contact
    const contactDetails = await Contact.findOne({ userId: user.id })

    if (!contactDetails) {
      console.log("No contact details found for user:", user.id)
      return null
    }

    return {
      emailId: contactDetails.emailId,
      userId: user.id,
    }
  } catch (error) {
    console.error("Error fetching seller email:", error)
    return null
  }
}

// GET handler to fetch reviews for seller's products
export async function GET(req: NextRequest) {
  try {
    const connection = await connectProfileDB()

    // Get seller details
    const sellerDetails = await getSellerEmail(connection)

    if (!sellerDetails) {
      return NextResponse.json(
        {
          error: "Seller details not found. Please complete your profile first.",
        },
        { status: 400 },
      )
    }

    // Get pagination parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get Product and Review models
    const Product = connection.models.Product
    const Review = connection.models.Review
    const Order = connection.models.Order

    if (!Product || !Review || !Order) {
      return NextResponse.json({ error: "Database models not found" }, { status: 500 })
    }

    // Find all products owned by this seller
    const sellerProducts = await Product.find({
      $or: [{ seller_id: sellerDetails.userId }, { emailId: sellerDetails.emailId }],
    }).select("product_id title image_link SKU")

    if (sellerProducts.length === 0) {
      return NextResponse.json({
        reviews: [],
        total: 0,
        page,
        totalPages: 0,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      })
    }

    // Get product IDs
    const productIds = sellerProducts.map((p) => p.product_id.toString())

    // Get total count of reviews for these products
    const totalReviews = await Review.countDocuments({
      product_id: { $in: productIds },
    })

    // Fetch reviews with pagination
    const reviews = await Review.find({
      product_id: { $in: productIds },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Enrich reviews with product and user information
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const product = sellerProducts.find((p) => p.product_id.toString() === review.product_id)

        // Get order details to find buyer name
        const order = await Order.findOne({ orderId: review.orderId }).select("billingDetails userId")

        const buyerName = order?.billingDetails?.firstName
          ? `${order.billingDetails.firstName} ${order.billingDetails.lastName || ""}`.trim()
          : "Anonymous"

        return {
          _id: review._id.toString(),
          orderId: review.orderId,
          userId: review.userId,
          product_id: review.product_id,
          productName: product?.title || "Unknown Product",
          productImage: product?.image_link || "/placeholder.svg",
          sku: product?.SKU || "N/A",
          buyerName,
          rating: review.rating,
          review: review.review,
          status: review.status,
          isVerifiedPurchase: review.isVerifiedPurchase,
          createdAt: review.createdAt,
        }
      }),
    )

    // Calculate statistics
    const allReviews = await Review.find({
      product_id: { $in: productIds },
    }).lean()

    const stats = {
      totalReviews: allReviews.length,
      averageRating: allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0,
      pending: allReviews.filter((r) => r.status === "pending").length,
      approved: allReviews.filter((r) => r.status === "approved").length,
      rejected: allReviews.filter((r) => r.status === "rejected").length,
    }

    return NextResponse.json({
      reviews: enrichedReviews,
      total: totalReviews,
      page,
      totalPages: Math.ceil(totalReviews / limit),
      stats,
    })
  } catch (error: any) {
    console.error("Error fetching seller reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews", message: error.message }, { status: 500 })
  }
}
