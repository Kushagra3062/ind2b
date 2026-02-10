import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(req: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Connect to the PROFILEDB database
    const { db } = await connectProfileDB()

    // Check if db is defined
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the orders collection
    const ordersCollection = db.collection("orders")

    let orders = []

    // If user is admin, fetch all orders
    if (user.type === "admin") {
      orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray()
    } else if (user.type === "seller") {
      orders = await ordersCollection
        .find({
          $or: [
            { "products.seller_id": user.id },
            { "products.seller_id": user.id.toString() },
            { "products.sellerId": user.id },
            { "products.sellerId": user.id.toString() },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray()
    }
    // If user is customer, fetch only their orders
    else {
      orders = await ordersCollection
        .find({
          userId: user.id,
        })
        .sort({ createdAt: -1 })
        .toArray()
    }

    // Transform the orders to handle MongoDB ObjectId serialization
    const serializedOrders = orders.map((order) => {
      // Process products to ensure image URLs are properly formatted
      const products =
        order.products?.map((product: any) => {
          return {
            ...product,
            // Ensure image_link is properly formatted
            image_link: product.image_link || "/placeholder.svg",
          }
        }) || []

      return {
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
        products: products,
      }
    })

    return NextResponse.json(serializedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
