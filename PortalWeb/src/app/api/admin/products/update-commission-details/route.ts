import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest) {
  try {
    console.log("Connected to PROFILE_DB")

    const { productId, commission_type, commission_value, final_price } = await request.json()

    console.log(
      `Attempting to update product with product_id: ${productId} commission details: ${commission_type}, ${commission_value}, final_price: ${final_price}`,
    )

    if (!productId || !commission_type || commission_value === undefined || final_price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: productId, commission_type, commission_value, final_price" },
        { status: 400 },
      )
    }

    // Validate commission_type
    if (!["percentage", "fixed"].includes(commission_type)) {
      return NextResponse.json({ error: "Invalid commission_type. Must be 'percentage' or 'fixed'" }, { status: 400 })
    }

    // Validate commission_value
    if (commission_value < 0) {
      return NextResponse.json({ error: "Commission value cannot be negative" }, { status: 400 })
    }

    // Validate final_price
    if (final_price < 0) {
      return NextResponse.json({ error: "Final price cannot be negative" }, { status: 400 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in connection")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Check if product exists and commission is enabled
    const existingProduct = await Product.findOne({ product_id: productId })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log(`Existing product found: ${existingProduct ? "Yes" : "No"}`)

    // Check if commission is enabled
    const productCommission = (existingProduct as any).commission || "No"
    if (productCommission !== "Yes") {
      return NextResponse.json(
        { error: "Commission must be enabled before setting commission details" },
        { status: 400 },
      )
    }

    // Update the product with commission details
    const updateResult = await Product.updateOne(
      { product_id: productId },
      {
        $set: {
          commission_type: commission_type,
          commission_value: Number(commission_value),
          final_price: Number(final_price),
          updated_at: new Date(),
        },
      },
    )

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

    console.log(
      `Product ID ${productId} commission details successfully updated in PROFILE_DB - Type: ${commission_type}, Value: ${commission_value}, Final Price: ${final_price}`,
    )

    return NextResponse.json({
      success: true,
      message: "Commission details updated successfully",
      data: {
        productId,
        commission_type,
        commission_value: Number(commission_value),
        final_price: Number(final_price),
      },
    })
  } catch (error) {
    console.error("Error updating commission details:", error)
    return NextResponse.json({ error: "Internal server error while updating commission details" }, { status: 500 })
  }
}
