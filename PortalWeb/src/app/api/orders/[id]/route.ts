import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { id: orderId } = await params

    // Connect to the database
    const connection = await connectProfileDB()
    const Order = connection.models.Order

    if (!Order) {
      return NextResponse.json({ error: "Order model not found" }, { status: 500 })
    }

    // Find the specific order
    let order
    try {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findOne({ _id: new mongoose.Types.ObjectId(orderId) })
      } else {
        return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
      }
    } catch (error) {
      console.error("Error finding order:", error)
      return NextResponse.json({ error: "Error finding order" }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if the user is an admin or the order belongs to the user
    if (user.type !== "admin" && order.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 })
    }

    // Transform the order to handle MongoDB ObjectId serialization and ensure proper product data
    const serializedOrder = {
      ...order.toObject(),
      _id: order._id.toString(),
      userId: order.userId.toString(),
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
      products:
        order.products?.map((product: any) => {
          console.log("Raw product data from DB:", product)

          // Handle different possible product data structures
          const productData = {
            productId: product.productId
              ? product.productId.toString()
              : product.product_id
                ? product.product_id.toString()
                : product.id || "unknown",
            product_id: product.product_id
              ? product.product_id.toString()
              : product.productId
                ? product.productId.toString()
                : undefined,
            title: product.title || product.name || product.productName || "Product",
            name: product.name || product.title || product.productName || "Product",
            price:
              typeof product.price === "number"
                ? product.price
                : typeof product.price === "string"
                  ? Number.parseFloat(product.price)
                  : 0,
            quantity:
              typeof product.quantity === "number"
                ? product.quantity
                : typeof product.quantity === "string"
                  ? Number.parseInt(product.quantity)
                  : 1,
            image_link:
              product.image_link ||
              product.image ||
              product.imageUrl ||
              product.img ||
              product.thumbnail ||
              "/placeholder.svg",
            image:
              product.image ||
              product.image_link ||
              product.imageUrl ||
              product.img ||
              product.thumbnail ||
              "/placeholder.svg",
            imageUrl:
              product.imageUrl ||
              product.image_link ||
              product.image ||
              product.img ||
              product.thumbnail ||
              "/placeholder.svg",
            // Include any other fields that might be present
            ...product,
          }

          console.log("Transformed product data:", productData)
          return productData
        }) || [],
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Check if user is an admin or seller
    if (user.type !== "admin" && user.type !== "seller") {
      return NextResponse.json({ error: "Unauthorized. Admin or seller access required" }, { status: 403 })
    }

    // Parse request body
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Connect to the database
    const connection = await connectProfileDB()
    const Order = connection.models.Order

    if (!Order) {
      return NextResponse.json({ error: "Order model not found" }, { status: 500 })
    }

    // Get the order ID from the URL
    const { id: orderId } = await params

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
    }

    // If user is a seller, ensure they can only update their own orders
    let query: any = { _id: new mongoose.Types.ObjectId(orderId) }

    if (user.type === "seller") {
      // For sellers, add a condition to check if the order contains their products
      query = {
        _id: new mongoose.Types.ObjectId(orderId),
        "products.sellerId": user.id,
      }
    }

    // Update the order status
    const result = await Order.updateOne(query, {
      $set: {
        status: status,
        updatedAt: new Date(),
      },
    })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found or you don't have permission to update it" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
