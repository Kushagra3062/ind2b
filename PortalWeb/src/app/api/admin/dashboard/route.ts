import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("Fetching admin dashboard data...")

    // Connect to database
    const connection = await connectProfileDB()
    console.log("Database connected successfully")

    // Get models from the connection
    let User, Product, Order, ProfileProgress

    try {
      // Try to get existing models
      User = mongoose.models.User || mongoose.model("User")
      Product = mongoose.models.Product || mongoose.model("Product")
      Order = mongoose.models.Order || mongoose.model("Order")
      ProfileProgress = mongoose.models.ProfileProgress || mongoose.model("ProfileProgress")

      console.log("Models retrieved successfully")
    } catch (modelError) {
      console.error("Error retrieving models:", modelError)

      // Fallback approach - try to access collections directly
      try {
        console.log("Attempting to access collections directly...")

        // Check if database connection exists
        if (!connection.db) {
          throw new Error("Database connection not available")
        }

        // Get collection references
        const db = connection.db
        const profileProgressesCollection = db.collection("profileprogresses")
        const productsCollection = db.collection("products")
        const ordersCollection = db.collection("orders")

        // Parallel data fetching using direct collections
        const [
          totalSellers,
          activeSellers,
          totalOrders,
          completedOrders,
          totalProducts,
          activeProducts,
          pendingProducts,
          allOrders,
          recentOrders,
        ] = await Promise.all([
          // Total sellers count from profileprogresses collection
          profileProgressesCollection.countDocuments({}),

          // Active sellers count (status: "Approved")
          profileProgressesCollection.countDocuments({
            status: "Approved",
          }),

          // Total orders count from orders collection
          ordersCollection.countDocuments({}),

          // Completed orders count
          ordersCollection.countDocuments({
            $or: [{ status: "completed" }, { status: "Completed" }, { status: "delivered" }, { status: "Delivered" }],
          }),

          // Total products count
          productsCollection.countDocuments({}),

          // Active/approved products count
          productsCollection.countDocuments({
            $or: [{ status: "Approved" }, { status: "approved" }, { isActive: true }],
          }),

          // Pending products count
          productsCollection.countDocuments({
            $or: [{ status: "pending" }, { status: "Pending" }, { status: { $exists: false } }, { isActive: false }],
          }),

          // All orders for revenue calculation
          ordersCollection
            .find({})
            .toArray(),

          // Recent orders (last 10)
          ordersCollection
            .find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray(),
        ])

        console.log("Raw data fetched using direct collections:", {
          totalSellers,
          activeSellers,
          totalOrders,
          completedOrders,
          totalProducts,
          activeProducts,
          pendingProducts,
          ordersCount: allOrders?.length || 0,
        })

        // Calculate total revenue from all orders
        let totalRevenue = 0
        let monthlyRevenue = 0
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        if (allOrders && Array.isArray(allOrders)) {
          allOrders.forEach((order: any) => {
            const orderTotal = order.totalAmount || 0
            totalRevenue += orderTotal

            // Calculate monthly revenue
            const orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
              monthlyRevenue += orderTotal
            }
          })
        }

        // Calculate growth percentages
        const sellersGrowth = activeSellers > 0 ? ((activeSellers / Math.max(totalSellers, 1)) * 100).toFixed(1) : "0"
        const ordersGrowth = completedOrders > 0 ? ((completedOrders / Math.max(totalOrders, 1)) * 100).toFixed(1) : "0"
        const productsGrowth = activeProducts > 0 ? "12.5" : "0" // Mock growth
        const revenueGrowth = totalRevenue > 0 ? "8.3" : "0" // Mock growth

        // Prepare dashboard data
        const dashboardData = {
          // Main KPIs
          totalSellers: totalSellers || 0,
          activeSellers: activeSellers || 0,
          totalOrders: totalOrders || 0,
          completedOrders: completedOrders || 0,
          totalProductsListed: totalProducts || 0,
          totalRevenue: totalRevenue || 0,
          productsPendingApproval: pendingProducts || 0,

          // Additional metrics
          monthlyRevenue: monthlyRevenue || 0,
          recentOrdersCount: recentOrders?.length || 0,

          // Growth indicators
          sellersGrowth: Number.parseFloat(sellersGrowth),
          ordersGrowth: Number.parseFloat(ordersGrowth),
          productsGrowth: Number.parseFloat(productsGrowth),
          revenueGrowth: Number.parseFloat(revenueGrowth),

          // Recent activity
          recentOrders: (recentOrders || []).slice(0, 5).map((order: any) => ({
            id: order._id?.toString() || "N/A",
            totalAmount: order.totalAmount || 0,
            status: order.status || "pending",
            createdAt: order.createdAt || new Date(),
            productsCount: order.products?.length || 0,
          })),

          // Timestamp for cache busting
          lastUpdated: new Date().toISOString(),
        }

        console.log("Dashboard data prepared using direct collections")

        return NextResponse.json({
          success: true,
          data: dashboardData,
        })
      } catch (collectionError) {
        console.error("Error accessing collections directly:", collectionError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to access database collections",
            details: collectionError instanceof Error ? collectionError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    }

    // If we get here, we have the models, so proceed with normal approach
    // Parallel data fetching for better performance
    const [
      totalSellers,
      activeSellers,
      totalOrders,
      completedOrders,
      totalProducts,
      activeProducts,
      pendingProducts,
      allOrders,
      recentOrders,
    ] = await Promise.all([
      // Total sellers count from ProfileProgress model
      ProfileProgress.countDocuments({}),

      // Active sellers count (status: "Approved")
      ProfileProgress.countDocuments({
        status: "Approved",
      }),

      // Total orders count from Order model
      Order.countDocuments({}),

      // Completed orders count
      Order.countDocuments({
        $or: [{ status: "completed" }, { status: "Completed" }, { status: "delivered" }, { status: "Delivered" }],
      }),

      // Total products count
      Product.countDocuments({}),

      // Active/approved products count
      Product.countDocuments({
        $or: [{ status: "Approved" }, { status: "approved" }, { isActive: true }],
      }),

      // Pending products count
      Product.countDocuments({
        $or: [{ status: "pending" }, { status: "Pending" }, { status: { $exists: false } }, { isActive: false }],
      }),

      // All orders for revenue calculation
      Order.find({}).lean(),

      // Recent orders (last 10)
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ])

    console.log("Raw data fetched using models:", {
      totalSellers,
      activeSellers,
      totalOrders,
      completedOrders,
      totalProducts,
      activeProducts,
      pendingProducts,
      ordersCount: allOrders?.length || 0,
    })

    // Calculate total revenue from all orders
    let totalRevenue = 0
    let monthlyRevenue = 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    if (allOrders && Array.isArray(allOrders)) {
      allOrders.forEach((order: any) => {
        const orderTotal = order.totalAmount || 0
        totalRevenue += orderTotal

        // Calculate monthly revenue
        const orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlyRevenue += orderTotal
        }
      })
    }

    // Calculate growth percentages
    const sellersGrowth = activeSellers > 0 ? ((activeSellers / Math.max(totalSellers, 1)) * 100).toFixed(1) : "0"
    const ordersGrowth = completedOrders > 0 ? ((completedOrders / Math.max(totalOrders, 1)) * 100).toFixed(1) : "0"
    const productsGrowth = activeProducts > 0 ? "12.5" : "0" // Mock growth
    const revenueGrowth = totalRevenue > 0 ? "8.3" : "0" // Mock growth

    // Prepare dashboard data
    const dashboardData = {
      // Main KPIs
      totalSellers: totalSellers || 0,
      activeSellers: activeSellers || 0,
      totalOrders: totalOrders || 0,
      completedOrders: completedOrders || 0,
      totalProductsListed: totalProducts || 0,
      totalRevenue: totalRevenue || 0,
      productsPendingApproval: pendingProducts || 0,

      // Additional metrics
      monthlyRevenue: monthlyRevenue || 0,
      recentOrdersCount: recentOrders?.length || 0,

      // Growth indicators
      sellersGrowth: Number.parseFloat(sellersGrowth),
      ordersGrowth: Number.parseFloat(ordersGrowth),
      productsGrowth: Number.parseFloat(productsGrowth),
      revenueGrowth: Number.parseFloat(revenueGrowth),

      // Recent activity
      recentOrders: (recentOrders || []).slice(0, 5).map((order: any) => ({
        id: order._id?.toString() || "N/A",
        totalAmount: order.totalAmount || 0,
        status: order.status || "pending",
        createdAt: order.createdAt || new Date(),
        productsCount: order.products?.length || 0,
      })),

      // Timestamp for cache busting
      lastUpdated: new Date().toISOString(),
    }

    console.log("Dashboard data prepared using models")

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
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
