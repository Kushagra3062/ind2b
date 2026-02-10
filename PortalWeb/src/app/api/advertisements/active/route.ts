import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// Simple in-memory cache for advertisements
let advertisementCache: {
  data: any[]
  timestamp: number
  deviceType: string
  position: string
} | null = null

const CACHE_DURATION = 20 * 60 * 1000 // 20 minutes (1,200,000 milliseconds)

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("deviceType") || "all"
    const position = searchParams.get("position") || "all"

    console.log("[v0] API: Fetching advertisements for:", { deviceType, position })

    if (advertisementCache && Date.now() - advertisementCache.timestamp < CACHE_DURATION) {
      const responseTime = Date.now() - startTime
      console.log(`[v0] API: Returning cached advertisements in ${responseTime}ms`)

      // Filter cached data by device type and position
      const filteredData = advertisementCache.data.filter((ad) => {
        const deviceMatch = deviceType === "all" || ad.deviceType === deviceType || ad.deviceType === "all"
        const positionMatch = position === "all" || ad.position === position || ad.position === "all"
        return deviceMatch && positionMatch
      })

      const response = NextResponse.json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        cached: true,
        responseTime: responseTime,
      })
      response.headers.set("Cache-Control", "public, s-maxage=1200, stale-while-revalidate=2400")

      return response
    }

    console.log(`[v0] API: Fetching fresh advertisements from database`)

    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const filter: any = { isActive: true }
    const now = new Date()

    // Date filter
    filter.$and = [
      {
        $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }],
      },
      {
        $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
      },
    ]

    console.log("[v0] API: Database filter:", JSON.stringify(filter, null, 2))

    const advertisements = await Advertisement.find(filter)
      .select("title subtitle description imageUrl imageData linkUrl order deviceType position isActive")
      .sort({ order: 1, createdAt: -1 })
      .limit(50) // Increased limit to get more advertisements
      .lean()
      .exec()

    const responseTime = Date.now() - startTime
    console.log(`[v0] API: Found ${advertisements.length} advertisements in ${responseTime}ms`)

    advertisements.forEach((ad, index) => {
      console.log(`[v0] API: Ad ${index + 1}:`, {
        id: ad._id,
        title: ad.title,
        position: ad.position,
        deviceType: ad.deviceType,
        isActive: ad.isActive,
      })
    })

    // Update cache with all advertisements
    advertisementCache = {
      data: advertisements,
      timestamp: Date.now(),
      deviceType: "all",
      position: "all",
    }

    // Filter for response
    const filteredData = advertisements.filter((ad) => {
      const deviceMatch = deviceType === "all" || ad.deviceType === deviceType || ad.deviceType === "all"
      const positionMatch = position === "all" || ad.position === position || ad.position === "all"
      return deviceMatch && positionMatch
    })

    console.log(`[v0] API: Returning ${filteredData.length} filtered advertisements`)

    const response = NextResponse.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      cached: false,
      responseTime: responseTime,
    })
    response.headers.set("Cache-Control", "public, s-maxage=1200, stale-while-revalidate=2400")

    return response
  } catch (error) {
    console.error("[v0] API: Error fetching active advertisements:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch advertisements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
