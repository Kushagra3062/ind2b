import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating product status in PROFILE_DB...")
    const { productId, status } = await request.json()

    if (!productId || !status) {
      return NextResponse.json({ error: "Product ID and status are required" }, { status: 400 })
    }

    // Validate status
    if (!["Pending", "Approved", "Flagged"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be Pending, Approved, or Flagged" }, { status: 400 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    console.log("Connected to PROFILE_DB")

    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in profileDb connection")
      return NextResponse.json({ error: "Product model not available" }, { status: 500 })
    }

    const productIdNum = Number.parseInt(productId.toString())
    console.log(`Attempting to update product with product_id: ${productIdNum} to status: ${status}`)

    // First check if the product exists
    const existingProduct = await Product.findOne({ product_id: productIdNum }).lean()
    console.log("Existing product found:", existingProduct ? "Yes" : "No")

    if (!existingProduct) {
      console.error(`Product with product_id ${productIdNum} not found in PROFILE_DB`)
      return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 })
    }

    const result = await Product.updateOne(
      { product_id: productIdNum },
      {
        $set: {
          status: status,
          updated_at: new Date(),
        },
      },
    )

    console.log("Update result:", {
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })

    if (!result.acknowledged) {
      console.error("Update operation was not acknowledged by MongoDB")
      return NextResponse.json({ error: "Database update failed - operation not acknowledged" }, { status: 500 })
    }

    if (result.matchedCount === 0) {
      console.error(`Product with ID ${productId} not found during update`)
      return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      console.log(`Product ${productId} was found but no changes were made (possibly same status)`)
    }

    const updatedProduct = await Product.findOne({ product_id: productIdNum }).lean()
    console.log(`Product ID ${productId} status successfully updated to ${status} in PROFILE_DB`)

    return NextResponse.json({
      success: true,
      message: `Product ID ${productId} status updated to ${status}`,
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Error updating product status in PROFILE_DB:", error)
    return NextResponse.json({ error: "Failed to update product status" }, { status: 500 })
  }
}
