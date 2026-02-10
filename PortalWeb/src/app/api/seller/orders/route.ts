import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log(`Fetching orders for seller: ${user.id}`)

    // Connect to the profile database with enhanced error handling
    let connection
    try {
      connection = await connectProfileDB()
      console.log("Database connection established successfully")
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Unable to connect to MongoDB Atlas. Please check your connection.",
          success: false,
        },
        { status: 503 },
      )
    }

    if (!connection) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Connection object is null",
          success: false,
        },
        { status: 503 },
      )
    }

    // Get the orders collection with enhanced error handling
    let Order
    try {
      Order = connection.models.Order || connection.model("Order", new mongoose.Schema({}, { strict: false }))
      console.log("Order model loaded successfully")
    } catch (modelError) {
      console.error("Error loading Order model:", modelError)
      return NextResponse.json(
        {
          error: "Model loading failed",
          details: "Unable to load Order model",
          success: false,
        },
        { status: 500 },
      )
    }

    // Find orders that contain products with the seller's ID
    let sellerOrders
    try {
      console.log(`Querying orders with seller_id: ${user.id}`)

      // Try multiple query strategies for better compatibility
      sellerOrders = await Order.find({
        $or: [
          { "products.seller_id": user.id },
          { "products.seller_id": user.id.toString() },
          { "products.sellerId": user.id },
          { "products.sellerId": user.id.toString() },
        ],
      })
        .sort({ createdAt: -1 })
        .lean()
        .maxTimeMS(30000) // 30 second timeout

      console.log(`Database query completed. Found ${sellerOrders.length} orders`)
    } catch (queryError) {
      console.error("Database query failed:", queryError)
      return NextResponse.json(
        {
          error: "Query execution failed",
          details: "Unable to fetch orders from database",
          success: false,
        },
        { status: 500 },
      )
    }

    // Process orders to filter products and calculate seller-specific data
    const processedOrders = sellerOrders
      .map((order: any) => {
        try {
          // Filter products to only include those belonging to this seller
          const sellerProducts = (order.products || []).filter(
            (product: any) =>
              product.seller_id === user.id ||
              product.seller_id === user.id.toString() ||
              product.sellerId === user.id ||
              product.sellerId === user.id.toString(),
          )

          // Calculate seller-specific subtotal
          const sellerSubtotal = sellerProducts.reduce((sum: number, product: any) => {
            const price = typeof product.price === "number" ? product.price : 0
            const quantity = typeof product.quantity === "number" ? product.quantity : 0
            return sum + price * quantity
          }, 0)

          return {
            _id: order._id?.toString() || "",
            orderId: order._id?.toString() || "",
            userId: order.userId || "",
            createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
            status: order.status || "pending",
            products: sellerProducts, // Only seller's products
            allProducts: order.products || [], // Keep reference to all products for context
            billingDetails: order.billingDetails || {},
            totalAmount: order.totalAmount || 0, // Total order amount
            sellerSubtotal: sellerSubtotal, // Amount for seller's products only
            paymentMethod: order.paymentMethod || "Not specified",
            paymentStatus: order.paymentStatus || "pending",
            additionalNotes: order.additionalNotes || "",
            warehouseSelected: order.warehouseSelected || false,
            logisticsSelected: order.logisticsSelected || false,
          }
        } catch (processingError) {
          console.error("Error processing order:", order._id, processingError)
          return null
        }
      })
      .filter(Boolean) // Remove any null entries from processing errors

    // Calculate summary statistics for the seller
    const totalOrders = processedOrders.length
    const totalRevenue = processedOrders.reduce((sum, order) => sum + (order?.sellerSubtotal || 0), 0)
    const pendingOrders = processedOrders.filter(
      (order) => order && ["pending", "processing"].includes(order.status.toLowerCase()),
    ).length
    const completedOrders = processedOrders.filter(
      (order) => order && ["delivered", "completed"].includes(order.status.toLowerCase()),
    ).length

    console.log(`Successfully processed ${processedOrders.length} orders for seller`)
    console.log(`Total revenue: ${totalRevenue}, Pending: ${pendingOrders}, Completed: ${completedOrders}`)

    return NextResponse.json({
      success: true,
      orders: processedOrders,
      summary: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
      },
      message: `Found ${totalOrders} orders containing your products`,
    })
  } catch (error) {
    console.error("Unexpected error in seller orders API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 500 },
    )
  }
}
