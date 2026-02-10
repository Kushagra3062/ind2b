import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose, { type Model, type Document } from "mongoose"

// Define interface for Product document
interface ProductDocument extends Document {
  title: string
  image_link?: string
  seller_name: string
  price: number
  stock: number
  status: string
  created_at: Date
  updated_at: Date
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the profile database
    const db = await connectProfileDB()

    // Get the products collection
    let Product: Model<ProductDocument>
    try {
      // Try to get the existing model
      Product = db.models.Product as Model<ProductDocument>
    } catch (e) {
      // If model doesn't exist, create a new one with the schema
      const schema = new mongoose.Schema(
        {
          title: { type: String, required: true },
          image_link: String,
          seller_name: { type: String, required: true },
          price: { type: Number, required: true },
          stock: { type: Number, required: true },
          status: { type: String, enum: ["Pending", "Approved", "Flagged"], default: "Pending" },
          created_at: { type: Date, default: Date.now },
          updated_at: { type: Date, default: Date.now },
        },
        { strict: false },
      )
      Product = db.model<ProductDocument>("Product", schema)
    }

    // Get query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "5")
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalProducts = await Product.countDocuments({})
    const totalPages = Math.ceil(totalProducts / limit)

    // Fetch recent products with pagination
    const recentProducts = await Product.find({}).sort({ created_at: -1 }).skip(skip).limit(limit).lean()

    // Transform the data to match the expected format
    const transformedProducts = recentProducts.map((product) => ({
      id: product._id?.toString() || "",
      name: product.title || "Unknown Product",
      image: product.image_link || "/placeholder.svg?height=40&width=40",
      sellerName: product.seller_name || "Unknown Seller",
      dateTime: product.created_at || new Date(),
      price: product.price || 0,
      stock: product.stock || 0,
      status: product.status || "Pending",
    }))

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        limit,
      },
    })
  } catch (error: unknown) {
    console.error("Error fetching recent products:", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recent products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
