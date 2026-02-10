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

    console.log("Fetching sales data...")

    // Connect to database
    const connection = await connectProfileDB()
    console.log("Database connected successfully")

    // Get the month parameter from query string
    const { searchParams } = new URL(request.url)
    const selectedMonth = searchParams.get("month") || "current"

    let Order

    try {
      // Try to get existing Order model
      Order = mongoose.models.Order || mongoose.model("Order")
      console.log("Order model retrieved successfully")
    } catch (modelError) {
      console.error("Error retrieving Order model:", modelError)

      // Fallback approach - access collection directly
      try {
        if (!connection.db) {
          throw new Error("Database connection not available")
        }

        const db = connection.db
        const ordersCollection = db.collection("orders")

        // Calculate date range based on selected month
        const currentDate = new Date()
        let startDate, endDate, monthName

        if (selectedMonth === "current") {
          // Current month
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          monthName = currentDate.toLocaleString("default", { month: "long" }).toLowerCase()
        } else {
          // Specific month (e.g., "october", "november", "december")
          const monthIndex = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
          ].indexOf(selectedMonth.toLowerCase())

          if (monthIndex === -1) {
            throw new Error("Invalid month parameter")
          }

          startDate = new Date(currentDate.getFullYear(), monthIndex, 1)
          endDate = new Date(currentDate.getFullYear(), monthIndex + 1, 0)
          monthName = selectedMonth.toLowerCase()
        }

        console.log(`Fetching sales data for ${monthName} from ${startDate} to ${endDate}`)

        // Fetch orders for the specified month
        const orders = await ordersCollection
          .find({
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          })
          .toArray()

        console.log(`Found ${orders.length} orders for ${monthName}`)

        // Group orders by day and calculate daily revenue
        const dailyRevenue: { [key: string]: number } = {}
        const daysInMonth = endDate.getDate()

        // Initialize all days with 0 revenue
        for (let day = 1; day <= daysInMonth; day++) {
          dailyRevenue[day.toString()] = 0
        }

        // Calculate daily revenue from orders
        orders.forEach((order: any) => {
          const orderDate = new Date(order.createdAt)
          const day = orderDate.getDate()
          const revenue = order.totalAmount || 0
          dailyRevenue[day.toString()] += revenue
        })

        // Calculate total revenue for the month
        const totalMonthlyRevenue = Object.values(dailyRevenue).reduce((sum, revenue) => sum + revenue, 0)

        // Create chart data points (sample every few days for better visualization)
        const chartData = []
        const sampleDays = Math.min(12, daysInMonth) // Show up to 12 data points
        const dayInterval = Math.ceil(daysInMonth / sampleDays)

        for (let i = 0; i < sampleDays; i++) {
          const day = Math.min(1 + i * dayInterval, daysInMonth)
          const revenue = dailyRevenue[day.toString()]
          const percentage = totalMonthlyRevenue > 0 ? (revenue / totalMonthlyRevenue) * 100 : 0

          chartData.push({
            day: day.toString(),
            revenue: revenue,
            percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
            label: `${Math.round(revenue / 1000)}k`, // Format as "5k", "10k", etc.
          })
        }

        console.log("Chart data prepared:", chartData)

        return NextResponse.json({
          success: true,
          data: {
            month: monthName,
            totalRevenue: totalMonthlyRevenue,
            chartData: chartData,
            ordersCount: orders.length,
          },
        })
      } catch (collectionError) {
        console.error("Error accessing orders collection:", collectionError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to access orders collection",
            details: collectionError instanceof Error ? collectionError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    }

    // If we get here, we have the Order model
    // Calculate date range based on selected month
    const currentDate = new Date()
    let startDate, endDate, monthName

    if (selectedMonth === "current") {
      // Current month
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      monthName = currentDate.toLocaleString("default", { month: "long" }).toLowerCase()
    } else {
      // Specific month
      const monthIndex = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ].indexOf(selectedMonth.toLowerCase())

      if (monthIndex === -1) {
        throw new Error("Invalid month parameter")
      }

      startDate = new Date(currentDate.getFullYear(), monthIndex, 1)
      endDate = new Date(currentDate.getFullYear(), monthIndex + 1, 0)
      monthName = selectedMonth.toLowerCase()
    }

    console.log(`Fetching sales data for ${monthName} from ${startDate} to ${endDate}`)

    // Fetch orders for the specified month
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean()

    console.log(`Found ${orders.length} orders for ${monthName}`)

    // Group orders by day and calculate daily revenue
    const dailyRevenue: { [key: string]: number } = {}
    const daysInMonth = endDate.getDate()

    // Initialize all days with 0 revenue
    for (let day = 1; day <= daysInMonth; day++) {
      dailyRevenue[day.toString()] = 0
    }

    // Calculate daily revenue from orders
    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt)
      const day = orderDate.getDate()
      const revenue = order.totalAmount || 0
      dailyRevenue[day.toString()] += revenue
    })

    // Calculate total revenue for the month
    const totalMonthlyRevenue = Object.values(dailyRevenue).reduce((sum, revenue) => sum + revenue, 0)

    // Create chart data points (sample every few days for better visualization)
    const chartData = []
    const sampleDays = Math.min(12, daysInMonth) // Show up to 12 data points
    const dayInterval = Math.ceil(daysInMonth / sampleDays)

    for (let i = 0; i < sampleDays; i++) {
      const day = Math.min(1 + i * dayInterval, daysInMonth)
      const revenue = dailyRevenue[day.toString()]
      const percentage = totalMonthlyRevenue > 0 ? (revenue / totalMonthlyRevenue) * 100 : 0

      chartData.push({
        day: day.toString(),
        revenue: revenue,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        label: `${Math.round(revenue / 1000)}k`, // Format as "5k", "10k", etc.
      })
    }

    console.log("Chart data prepared:", chartData)

    return NextResponse.json({
      success: true,
      data: {
        month: monthName,
        totalRevenue: totalMonthlyRevenue,
        chartData: chartData,
        ordersCount: orders.length,
      },
    })
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sales data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
