import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest) {
  try {
    console.log("Connected to PROFILE_DB")

    const { productId, commission } = await request.json()

    console.log(`Attempting to update product with product_id: ${productId} commission: ${commission}`)

    if (!productId || !commission) {
      return NextResponse.json({ error: "Missing required fields: productId, commission" }, { status: 400 })
    }

    // Validate commission value
    if (!["Yes", "No"].includes(commission)) {
      return NextResponse.json({ error: "Invalid commission value. Must be 'Yes' or 'No'" }, { status: 400 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in connection")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Check if product exists
    const existingProduct = await Product.findOne({ product_id: productId })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log(`Existing product found: ${existingProduct ? "Yes" : "No"}`)

    // Prepare update data
    const updateData: any = {
      commission: commission,
      updated_at: new Date(),
    }

    // If commission is being disabled, reset commission details
    if (commission === "No") {
      updateData.commission_type = "percentage"
      updateData.commission_value = 0
      updateData.final_price = (existingProduct as any).price || 0
    }

    // Update the product
    const updateResult = await Product.updateOne({ product_id: productId }, { $set: updateData })

    console.log("Update result:", updateResult)

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made to the product" }, { status: 400 })
    }

    // Fetch the updated product to verify the update
    const updatedProduct = await Product.findOne({ product_id: productId })

    if (updatedProduct) {
      const safeProduct = updatedProduct as any
      console.log("Updated product commission details:", {
        commission: safeProduct.commission || "No",
        commission_type: safeProduct.commission_type || "percentage",
        commission_value: safeProduct.commission_value || 0,
        final_price: safeProduct.final_price || 0,
        original_price: safeProduct.price || 0,
      })
    }

    console.log(`Product ID ${productId} commission successfully updated in PROFILE_DB - Commission: ${commission}`)

    return NextResponse.json({
      success: true,
      message: "Commission updated successfully",
      data: {
        productId,
        commission,
        ...(commission === "No" && {
          commission_type: "percentage",
          commission_value: 0,
          final_price: (existingProduct as any).price || 0,
        }),
      },
    })
  } catch (error) {
    console.error("Error updating commission:", error)
    return NextResponse.json({ error: "Internal server error while updating commission" }, { status: 500 })
  }
}
