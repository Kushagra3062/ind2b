import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define interfaces for type safety
interface ContactData {
  _id: any
  userId: string
  contactName?: string
  firstName?: string
  lastName?: string
  name?: string
  [key: string]: any
}

interface ProductData {
  _id: any
  seller_id?: string
  sellerId?: string
  price?: number
  stock?: number
  is_draft?: boolean
  status?: string
  [key: string]: any
}

interface OrderData {
  _id: any
  products?: Array<{
    seller_id?: string
    sellerId?: string
    price?: number
    quantity?: number
    title?: string
    product_id?: string
    productId?: string
  }>
  createdAt?: string | Date
  status?: string
  billingDetails?: {
    firstName?: string
    lastName?: string
    company?: string
  }
  paymentStatus?: string
  orderNumber?: string
  [key: string]: any
}

export async function GET(req: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log(`Fetching dashboard data for seller: ${user.id}`)

    // Connect to the profile database
    const connection = await connectProfileDB()

    if (!connection) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the necessary models
    const Product = connection.models.Product || connection.model("Product", new mongoose.Schema({}, { strict: false }))
    const Order = connection.models.Order || connection.model("Order", new mongoose.Schema({}, { strict: false }))
    const Contact = connection.models.Contact || connection.model("Contact", new mongoose.Schema({}, { strict: false }))

    // Get seller contact details for name with proper type assertion
    const contactDetails = (await Contact.findOne({ userId: user.id }).lean()) as ContactData | null

    // Try multiple fields for seller name
    const sellerName =
      contactDetails?.contactName || contactDetails?.firstName || contactDetails?.name || user.name || "Seller"

    console.log(`Seller name found: ${sellerName}`)

    // Get current date and first day of month for monthly calculations
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all products by this seller with proper type assertion
    const products = (await Product.find({
      $or: [{ seller_id: user.id }, { sellerId: user.id }],
    }).lean()) as ProductData[]

    console.log(`Found ${products.length} products for seller`)

    // Calculate product metrics
    const totalProducts = products.length
    const pendingProducts = products.filter((p) => p.is_draft === true || p.status === "Pending").length

    // Calculate inventory value
    const inventoryValue = products.reduce((total: number, product) => {
      const price = typeof product.price === "number" ? product.price : 0
      const stock = typeof product.stock === "number" ? product.stock : 0
      return total + price * stock
    }, 0)

    console.log(`Inventory value calculated: ${inventoryValue}`)

    // Fetch orders containing seller's products with proper type assertion
    const allOrders = (await Order.find({
      $or: [{ "products.seller_id": user.id }, { "products.sellerId": user.id }],
      createdAt: { $gte: firstDayOfMonth },
    })
      .sort({ createdAt: -1 })
      .lean()) as OrderData[]

    console.log(`Found ${allOrders.length} orders for seller this month`)

    // Process orders to get seller-specific data
    const processedOrders = allOrders
      .map((order) => {
        // Filter products to only include those belonging to this seller
        const sellerProducts = (order.products || []).filter(
          (product) => product.seller_id === user.id || product.sellerId === user.id,
        )

        // Calculate seller-specific subtotal
        const sellerSubtotal = sellerProducts.reduce((sum: number, product) => {
          const price = typeof product.price === "number" ? product.price : 0
          const quantity = typeof product.quantity === "number" ? product.quantity : 0
          return sum + price * quantity
        }, 0)

        // Get first seller product for display
        const firstProduct = sellerProducts[0]
        const productTitle = firstProduct?.title || "Product"

        return {
          _id: order._id?.toString() || "",
          orderId: order._id?.toString() || "",
          orderNumber: order.orderNumber || order._id?.toString().slice(-4) || "",
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          status: order.status || "pending",
          products: sellerProducts,
          productTitle,
          customer: order.billingDetails?.firstName
            ? `${order.billingDetails.firstName} ${order.billingDetails.lastName || ""}`.trim()
            : "Customer",
          customerCompany: order.billingDetails?.company || "",
          amount: sellerSubtotal,
          paymentStatus: order.paymentStatus || "pending",
        }
      })
      .filter((order) => order.amount > 0) // Only include orders with seller products

    // Calculate order metrics
    const pendingOrders = processedOrders.filter((order) =>
      ["pending", "processing"].includes(order.status.toLowerCase()),
    ).length

    // Calculate monthly sales
    const monthlySales = processedOrders.reduce((total, order) => total + order.amount, 0)

    // Get recent orders (last 5)
    const recentOrders = processedOrders.slice(0, 5)

    // Calculate daily sales for the past week
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    const dailySales = last7Days.map((date) => {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayOrders = processedOrders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dayStart && orderDate <= dayEnd
      })

      const daySales = dayOrders.reduce((total, order) => total + order.amount, 0)

      return {
        date: date.toISOString().split("T")[0],
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
        sales: daySales,
      }
    })

    console.log(`Dashboard data compiled successfully for ${sellerName}`)

    return NextResponse.json({
      success: true,
      sellerName,
      metrics: {
        totalProducts,
        pendingProducts,
        inventoryValue,
        monthlySales,
        pendingOrders,
      },
      recentOrders,
      dailySales,
    })
  } catch (error) {
    console.error("Error fetching seller dashboard data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
