import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(req: NextRequest, { params }: { params:any }) {
  try {
    const orderId = params.id
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get the current logged-in user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    if (!connection) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the products collection to find seller's products
    const Product = connection.models.Product || connection.model("Product", new mongoose.Schema({}, { strict: false }))

    // Find all products belonging to this seller
    const sellerProducts = await Product.find({
      $or: [{ seller_id: user.id }, { sellerId: user.id }],
    }).lean()

    if (!sellerProducts || sellerProducts.length === 0) {
      return NextResponse.json({ error: "No products found for this seller" }, { status: 404 })
    }

    // Extract product IDs in all possible formats
    const sellerProductIds = sellerProducts
      .map((product: any) => (product._id ? product._id.toString() : ""))
      .filter(Boolean)

    // Create path-based IDs that match the format in orders
    const sellerProductPaths = sellerProducts.map(
      (product: any) => `/products/${product._id ? product._id.toString() : ""}`,
    )

    // Also create simple numeric IDs for additional matching
    const numericIds = sellerProductIds.map((id) => {
      const match = id.match(/([0-9a-f]{24})$/i)
      return match ? match[1] : id
    })

    // Create a set of all possible ID formats for efficient lookup
    const allPossibleIds = new Set([...sellerProductIds, ...sellerProductPaths, ...numericIds])

    console.log("Seller product IDs (all formats):", Array.from(allPossibleIds).join(", "))

    // Get the orders collection
    const Order = connection.models.Order || connection.model("Order", new mongoose.Schema({}, { strict: false }))

    // Find the order by ID
    let orderDoc: any = null
    try {
      orderDoc = await Order.findOne({
        $or: [{ _id: orderId }, { _id: new mongoose.Types.ObjectId(orderId) }],
      }).lean()
    } catch (err) {
      console.error("Error finding order:", err)
      // If ObjectId conversion fails, try as string
      orderDoc = await Order.findOne({ _id: orderId }).lean()
    }

    if (!orderDoc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("Found order:", orderDoc._id)

    // Check if the order contains any of the seller's products
    const orderProducts = Array.isArray(orderDoc.products) ? orderDoc.products : []

    // Filter products to only include those belonging to this seller
    const sellerProductsInOrder = orderProducts.filter((product: any) => {
      const productId = product.productId ? product.productId.toString() : ""
      const productPath = `/products/${productId}`
      const numericMatch = productId.match(/([0-9a-f]{24})$/i)
      const numericId = numericMatch ? numericMatch[1] : productId

      return allPossibleIds.has(productId) || allPossibleIds.has(productPath) || allPossibleIds.has(numericId)
    })

    if (sellerProductsInOrder.length === 0) {
      return NextResponse.json({ error: "This order does not contain any of your products" }, { status: 403 })
    }

    // Calculate subtotal for seller's products in this order
    const sellerSubtotal = sellerProductsInOrder.reduce((sum: number, product: any) => {
      const price = typeof product.price === "number" ? product.price : 0
      const quantity = typeof product.quantity === "number" ? product.quantity : 0
      return sum + price * quantity
    }, 0)

    // Return order with only seller's products
    const processedOrder = {
      ...orderDoc,
      _id: orderDoc._id ? orderDoc._id.toString() : "",
      id: orderDoc._id ? orderDoc._id.toString() : "",
      createdAt: orderDoc.createdAt ? new Date(orderDoc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: orderDoc.updatedAt ? new Date(orderDoc.updatedAt).toISOString() : new Date().toISOString(),
      products: sellerProductsInOrder,
      sellerSubtotal: sellerSubtotal,
      // Include original order total for reference
      originalTotal: orderDoc.totalAmount || 0,
    }

    return NextResponse.json({ order: processedOrder })
  } catch (error) {
    console.error("Error fetching order details:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}
