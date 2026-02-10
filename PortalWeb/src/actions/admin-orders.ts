"use server"

import { connectProfileDB } from "@/lib/profileDb"

// Function to get order statistics
export async function getOrderStats() {
  try {
    const conn = await connectProfileDB()
    const Order = conn.model("Order")

    // Get total orders count
    const totalOrders = await Order.countDocuments()

    // Get pending orders count (handle case sensitivity in status)
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["PENDING", "pending", "Pending"] },
    })

    // Get shipped orders count
    const shippedOrders = await Order.countDocuments({
      status: { $in: ["SHIPPED", "shipped", "Shipped"] },
    })

    // Get delivered orders count
    const deliveredOrders = await Order.countDocuments({
      status: { $in: ["DELIVERED", "delivered", "Delivered"] },
    })

    // Get return requests count (if you have this status)
    const returnRequests = await Order.countDocuments({
      status: { $in: ["RETURNED", "returned", "Returned", "Return Requested"] },
    })

    // Calculate month-over-month changes (simplified for now)
    // In a real app, you would compare with last month's data
    const getRandomChange = () => {
      const isPositive = Math.random() > 0.5
      return `${isPositive ? "+" : "-"}${Math.floor(Math.random() * 25)}%`
    }

    return [
      {
        title: "Total Orders",
        value: totalOrders.toString(),
        change: getRandomChange(),
        icon: "ShoppingCart",
        color: "bg-orange-500",
      },
      {
        title: "Pending Order",
        value: pendingOrders.toString(),
        change: getRandomChange(),
        icon: "Clock",
        color: "bg-red-500",
      },
      {
        title: "Orders Shipped",
        value: shippedOrders.toString(),
        change: getRandomChange(),
        icon: "Package",
        color: "bg-blue-500",
      },
      {
        title: "Order Delivered",
        value: deliveredOrders.toString(),
        change: getRandomChange(),
        icon: "Truck",
        color: "bg-green-500",
      },
      {
        title: "Return Requests",
        value: returnRequests.toString(),
        change: getRandomChange(),
        icon: "RotateCcw",
        color: "bg-orange-500",
      },
    ]
  } catch (error) {
    console.error("Error fetching order stats:", error)
    return []
  }
}

// Function to get revenue data for the chart
export async function getRevenueData(dateRange?: { from?: Date; to?: Date }, statusFilter?: string) {
  try {
    const conn = await connectProfileDB()
    const Order = conn.model("Order")

    const currentDate = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const revenueData = []

    // Determine the date range
    let startDate = new Date()
    startDate.setDate(currentDate.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)

    let endDate = new Date(currentDate)
    endDate.setHours(23, 59, 59, 999)

    // Override with provided dateRange if available
    if (dateRange?.from) {
      startDate = new Date(dateRange.from)
      startDate.setHours(0, 0, 0, 0)
    }
    if (dateRange?.to) {
      endDate = new Date(dateRange.to)
      endDate.setHours(23, 59, 59, 999)
    }

    // Build the query filter
    const baseQuery: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    }

    // Add status filter if provided
    if (statusFilter && statusFilter !== "ALL_STATUSES") {
      baseQuery.status = {
        $regex: new RegExp(`^${statusFilter}$`, "i"),
      }
    }

    // Generate date labels based on the date range
    const dateLabels = []
    const currentCheck = new Date(startDate)
    while (currentCheck <= endDate) {
      dateLabels.push({
        date: new Date(currentCheck),
        label: days[currentCheck.getDay()],
        startOfDay: new Date(currentCheck),
        endOfDay: new Date(currentCheck.getTime() + 24 * 60 * 60 * 1000 - 1),
      })
      currentCheck.setDate(currentCheck.getDate() + 1)
    }

    // Query and aggregate revenue for each day
    for (const dayInfo of dateLabels) {
      const dayQuery = {
        ...baseQuery,
        createdAt: { $gte: dayInfo.startOfDay, $lt: dayInfo.endOfDay },
      }

      const dayOrders = await Order.find(dayQuery)

      const dayRevenue = dayOrders.reduce((total, order) => {
        return total + (order.totalAmount || 0)
      }, 0)

      revenueData.push({
        name: dayInfo.label,
        value: Math.round(dayRevenue),
      })
    }

    return revenueData
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return []
  }
}

// Function to get order summary data for the pie chart
export async function getOrderSummaryData() {
  try {
    const conn = await connectProfileDB()
    const Order = conn.model("Order")

    // Get counts for different order statuses
    const pendingCount = await Order.countDocuments({
      status: { $in: ["PENDING", "pending", "Pending"] },
    })

    const shippedCount = await Order.countDocuments({
      status: { $in: ["SHIPPED", "shipped", "Shipped"] },
    })

    const deliveredCount = await Order.countDocuments({
      status: { $in: ["DELIVERED", "delivered", "Delivered"] },
    })

    return [
      { name: "Pending Orders", value: pendingCount, color: "#ff4d4f" },
      { name: "Shipped Orders", value: shippedCount, color: "#52c41a" },
      { name: "Delivered Orders", value: deliveredCount, color: "#1890ff" },
    ]
  } catch (error) {
    console.error("Error fetching order summary data:", error)
    return []
  }
}

// Function to get orders with pagination and filtering
export async function getOrders(page = 1, dateFilter = "all", statusFilter = "all") {
  try {
    const conn = await connectProfileDB()
    const Order = conn.model("Order")

    const itemsPerPage = 5
    const skip = (page - 1) * itemsPerPage

    // Build the query based on filters
    const query: any = {}

    if (statusFilter !== "all") {
      // Handle case insensitivity for status
      query.status = {
        $regex: new RegExp(`^${statusFilter}$`, "i"),
      }
    }

    if (dateFilter !== "all") {
      // Parse the date filter
      const currentDate = new Date()

      if (dateFilter === "today") {
        const startOfDay = new Date(currentDate)
        startOfDay.setHours(0, 0, 0, 0)
        query.createdAt = { $gte: startOfDay }
      } else if (dateFilter === "yesterday") {
        const startOfYesterday = new Date(currentDate)
        startOfYesterday.setDate(currentDate.getDate() - 1)
        startOfYesterday.setHours(0, 0, 0, 0)

        const endOfYesterday = new Date(currentDate)
        endOfYesterday.setDate(currentDate.getDate() - 1)
        endOfYesterday.setHours(23, 59, 59, 999)

        query.createdAt = { $gte: startOfYesterday, $lte: endOfYesterday }
      } else if (dateFilter === "last7days") {
        const last7Days = new Date(currentDate)
        last7Days.setDate(currentDate.getDate() - 7)
        query.createdAt = { $gte: last7Days }
      } else if (dateFilter === "last30days") {
        const last30Days = new Date(currentDate)
        last30Days.setDate(currentDate.getDate() - 30)
        query.createdAt = { $gte: last30Days }
      } else if (dateFilter === "thisMonth") {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        query.createdAt = { $gte: startOfMonth }
      } else if (dateFilter === "lastMonth") {
        const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999)
        query.createdAt = { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }
    }

    // Get total count for pagination
    const totalCount = await Order.countDocuments(query)

    // Get the orders
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(itemsPerPage).lean()

    // Process orders for display
    const enhancedOrders = orders.map((order: any) => {
      // Format the date
      const orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
      const displayDate = `${orderDate.getDate().toString().padStart(2, "0")} ${orderDate.toLocaleString("default", {
        month: "short",
      })} ${orderDate.getFullYear()}`

      // Get buyer name from billing details if available
      const buyerName =
        order.billingDetails?.firstName && order.billingDetails?.lastName
          ? `${order.billingDetails.firstName} ${order.billingDetails.lastName}`
          : order.billingDetails?.email || "Unknown User"

      // Determine payment status based on payment method
      const paymentStatus = order.paymentMethod === "ONLINE" ? "Paid" : "COD"

      return {
        id: order._id.toString(),
        buyer: buyerName,
        seller: order.products?.[0]?.seller || "Multiple Sellers",
        date: orderDate.toISOString().split("T")[0],
        displayDate,
        total: `₹${(order.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: order.status || "Pending",
        payment: paymentStatus,
      }
    })

    return {
      orders: enhancedOrders,
      totalPages: Math.ceil(totalCount / itemsPerPage),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return { orders: [], totalPages: 0, currentPage: 1 }
  }
}

// Function to get unique order statuses
export async function getOrderStatuses() {
  try {
    const conn = await connectProfileDB()
    const Order = conn.model("Order")

    const statuses = await Order.distinct("status")
    return statuses.filter((status) => status) // Filter out null/undefined values
  } catch (error) {
    console.error("Error fetching order statuses:", error)
    return []
  }
}
