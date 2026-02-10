import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import getBrowsingHistoryModel from "@/models/profile/browsing-history"
import { getCurrentUser } from "@/actions/auth"

// GET /api/browsing-history?limit=10
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || 10)

    const connection = await connectProfileDB()
    const BrowsingHistory = getBrowsingHistoryModel(connection)

    const items = await BrowsingHistory.find({ userId: user.id })
      .sort({ viewedAt: -1 })
      .limit(Math.max(1, Math.min(limit, 50)))
      .lean()

    return NextResponse.json({ items })
  } catch (error) {
    console.error("GET /api/browsing-history error:", error)
    return NextResponse.json({ items: [], error: "Failed to fetch browsing history" }, { status: 500 })
  }
}

// POST /api/browsing-history
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false }, { status: 200 })
    }

    const body = await request.json()
    const { productId, title, image, category } = body || {}
    if (!productId) {
      return NextResponse.json({ success: false, error: "productId required" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const BrowsingHistory = getBrowsingHistoryModel(connection)

    // Upsert by latest view: keep only one doc per (userId, productId) by replacing/setting viewedAt now
    await BrowsingHistory.findOneAndUpdate(
      { userId: user.id, productId: String(productId) },
      { $set: { title, image, category, viewedAt: new Date() } },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/browsing-history error:", error)
    return NextResponse.json({ success: false, error: "Failed to record browsing history" }, { status: 500 })
  }
}


