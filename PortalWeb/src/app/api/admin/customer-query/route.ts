import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const queryType = searchParams.get("queryType") || ""

    const skip = (page - 1) * limit

    // Get database connection
    const connection = await connectProfileDB()
    const db = connection.db
    
    if (!db) {
      throw new Error("Database connection failed")
    }

    // Build filter object
    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    if (status) {
      filter.status = status
    }

    if (queryType) {
      filter.queryType = queryType
    }

    // Get messages with pagination
    const messages = await db.collection("messages")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const totalMessages = await db.collection("messages").countDocuments(filter)

    // Get statistics
    const stats = await db.collection("messages")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    const statistics = stats[0] || {
      total: 0,
      new: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.map((msg) => ({
          _id: msg._id.toString(),
          name: msg.name || "N/A",
          email: msg.email || "N/A",
          phone: msg.phone || "N/A",
          queryType: msg.queryType || "general",
          message: msg.message || "",
          orderId: msg.orderId || null,
          status: msg.status || "new",
          priority: msg.priority || "medium",
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page < Math.ceil(totalMessages / limit),
          hasPrev: page > 1,
        },
        statistics,
      },
    })
  } catch (error) {
    console.error("Error fetching customer queries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch customer queries" }, { status: 500 })
  }
}
