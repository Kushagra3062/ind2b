import { NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const vibeLabel = searchParams.get("vibeLabel") || ""

    const connection = await connectProfileDB()
    if (!connection || !connection.db) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      )
    }

    const db = connection.db
    const feedbacksCollection = db.collection("feedbacks")

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ]
    }

    if (category) {
      query.category = category
    }

    if (vibeLabel) {
      query.vibeLabel = vibeLabel
    }

    // Get total count
    const totalFeedbacks = await feedbacksCollection.countDocuments(query)

    // Get feedbacks with pagination
    const feedbacks = await feedbacksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Get unique categories and vibe labels for filters
    const categories = await feedbacksCollection.distinct("category")
    const vibeLabels = await feedbacksCollection.distinct("vibeLabel")

    // Calculate statistics
    const allFeedbacks = await feedbacksCollection.find({}).toArray()
    const totalCount = allFeedbacks.length
    const avgEmoji = totalCount > 0 
      ? allFeedbacks.reduce((sum, feedback) => sum + (feedback.emoji || 0), 0) / totalCount 
      : 0

    // Category distribution
    const categoryData = categories.map(cat => ({
      category: cat,
      count: allFeedbacks.filter(f => f.category === cat).length
    }))

    // Vibe distribution
    const vibeData = vibeLabels.map(vibe => ({
      vibeLabel: vibe,
      count: allFeedbacks.filter(f => f.vibeLabel === vibe).length
    }))

    const stats = {
      totalFeedbacks: totalCount,
      avgEmoji,
      categoryData,
      vibeData
    }

    return NextResponse.json({
      success: true,
      data: {
        feedbacks: feedbacks.map(feedback => ({
          ...feedback,
          _id: feedback._id.toString()
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFeedbacks / limit),
          totalFeedbacks,
          limit
        },
        filters: {
          categories,
          vibeLabels
        },
        stats
      }
    })

  } catch (error) {
    console.error("Error fetching feedbacks:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedbacks" },
      { status: 500 }
    )
  }
}
