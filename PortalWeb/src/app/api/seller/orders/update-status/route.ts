import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { getCurrentUser } from "@/actions/auth"

// Define order interface
interface OrderData {
  _id: any
  userId: string
  products: Array<{
    productId?: string
    product_id?: string
    seller_id?: string
    title: string
    quantity: number
    price: number
    image_link?: string
  }>
  status: string
  [key: string]: any
}

export async function PATCH(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a seller
    if (user.type !== "seller") {
      return NextResponse.json({ success: false, error: "Seller access required" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "Order ID and status are required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 })
    }

    // Connect to database
    console.log("Connecting to profile database")
    const connection = await connectProfileDB()
    console.log("Profile database connected successfully")

    // Get Order model
    const OrderModel = connection.models.Order || connection.model("Order", new mongoose.Schema({}, { strict: false }))

    // Find the order with proper type assertion
    const order = (await OrderModel.findById(orderId).lean()) as OrderData | null
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Verify seller owns products in this order
    const sellerProducts =
      order.products?.filter(
        (product: any) => product.seller_id === user.id || product.seller_id === user.id.toString(),
      ) || []

    if (sellerProducts.length === 0) {
      return NextResponse.json({ success: false, error: "You don't have products in this order" }, { status: 403 })
    }

    console.log(`Updating order ${orderId} status to ${status}`)

    // Update order status
    await OrderModel.findByIdAndUpdate(orderId, { status })

    console.log(`Order status updated successfully`)

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 })
  }
}
