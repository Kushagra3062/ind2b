// If this file exists, update the product schema here as well
import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { getCurrentUser } from "@/actions/auth"

// Define the Product schema with emailId field
const productSchema = new mongoose.Schema({
  product_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  model: String,
  description: String,
  category_id: Number,
  sub_category_id: Number,
  units: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  image_link: String,
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: Number,
  SKU: { type: String, required: true },
  seller_id: String,
  emailId: { type: String, required: true }, // Added emailId field
  created_at: { type: Date, default: Date.now },
  rating: Number,
  updated_at: { type: Date, default: Date.now },
  seller_name: { type: String, required: true },
  location: { type: String, required: true },
  category_name: { type: String, required: true },
  sub_category_name: String,
  is_draft: { type: Boolean, default: true }, // Default to true for drafts
  isActive: { type: Boolean, default: true },
})

// Create or get the model
let Product: mongoose.Model<any>

// POST handler to save a draft product
export async function POST(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Register the Product model with this connection if it doesn't exist
    if (!connection.models.Product) {
      connection.model("Product", productSchema)
    }

    // Get the Product model from this connection
    Product = connection.models.Product

    const data = await req.json()
    console.log("Received draft product data:", data)
    console.log("Email ID from request:", data.emailId)

    // Validate emailId
    if (!data.emailId) {
      return NextResponse.json(
        {
          error: "Seller email is required",
        },
        { status: 400 },
      )
    }

    // Get current user to associate with the product
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      )
    }

    // Add seller_id to the product data
    data.seller_id = user.id

    // Check if this is an update to an existing draft
    if (data.product_id) {
      // Update existing draft
      const updatedDraft = await Product.findOneAndUpdate(
        { product_id: data.product_id },
        {
          ...data,
          updated_at: new Date(),
          is_draft: true,
          emailId: data.emailId, // Explicitly set emailId
        },
        { new: true, upsert: true },
      )

      console.log("Updated draft product:", updatedDraft)
      return NextResponse.json(updatedDraft)
    } else {
      // Generate a new product_id for a new draft
      const highestProduct = await Product.findOne().sort({ product_id: -1 })
      const nextProductId = highestProduct ? highestProduct.product_id + 1 : 1

      // Create a new draft product with explicit emailId
      const draftData = {
        ...data,
        product_id: nextProductId,
        created_at: new Date(),
        updated_at: new Date(),
        is_draft: true,
        emailId: data.emailId, // Explicitly set emailId
      }

      console.log("Final draft product data to save:", draftData)

      const draftProduct = new Product(draftData)
      await draftProduct.save()

      console.log("Saved draft product:", draftProduct)
      return NextResponse.json(draftProduct, { status: 201 })
    }
  } catch (error: any) {
    console.error("Error saving draft product:", error)
    return NextResponse.json({ error: "Failed to save draft product", message: error.message }, { status: 500 })
  }
}
