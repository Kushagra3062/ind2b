import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"
import mongoose from "mongoose"

export async function PATCH(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Check if user is an admin
    if (user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required" }, { status: 403 })
    }

    // Parse the request body
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Connect to the database
    const connection = await connectProfileDB()
    const OrderModel = connection.models.Order

    if (!OrderModel) {
      return NextResponse.json({ error: "Order model not found" }, { status: 500 })
    }

    // Convert orderId to ObjectId properly
    let objectId: mongoose.Types.ObjectId
    try {
      objectId = new mongoose.Types.ObjectId(orderId)
    } catch (error) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
    }

    // Update the order status
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      objectId,
      {
        status: status.toUpperCase(),
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: updatedOrder._id.toString(),
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
