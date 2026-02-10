// Server-side utilities - contains database operations and Mongoose imports

import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Server-side function to get seller email
export async function getSellerEmailFromServer() {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      console.log("No user ID found in session")
      return null
    }

    return { userId: user.id }
  } catch (error) {
    console.error("Error getting seller email from server:", error)
    return null
  }
}

// Function to get seller's product IDs
export async function getSellerProductIds(sellerId: string): Promise<string[]> {
  try {
    const connection = await connectProfileDB()

    if (!connection) {
      throw new Error("Database connection failed")
    }

    // Use the imported mongoose instance to create a schema
    const productSchema = new mongoose.Schema({}, { strict: false })

    // Use the connection to create a model with the schema
    const Product = connection.models.Product || connection.model("Product", productSchema)

    // Find all products belonging to this seller
    const sellerProducts = await Product.find({
      $or: [{ seller_id: sellerId }, { sellerId: sellerId }],
    }).lean()

    console.log(`Found ${sellerProducts.length} products for seller ${sellerId}`)

    // Extract product IDs in both formats: ObjectId and path-based
    const productIds = sellerProducts.map((product: any) => (product._id ? product._id.toString() : "")).filter(Boolean)

    // Create path-based IDs that match the format in orders
    const productPaths = sellerProducts.map((product: any) => `/products/${product._id ? product._id.toString() : ""}`)

    // Also create numeric IDs for additional matching
    const numericIds = productIds.map((id) => {
      // Try to extract numeric part if it exists
      const match = id.match(/([0-9a-f]{24})$/i)
      return match ? match[1] : id
    })

    // Return all possible formats for maximum matching capability
    return [...new Set([...productIds, ...productPaths, ...numericIds])]
  } catch (error) {
    console.error("Error getting seller product IDs:", error)
    return []
  }
}
