import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

export async function GET(request: NextRequest) {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()
    const PromotionSettings = connection.models.PromotionSettings

    if (!PromotionSettings) {
      throw new Error("PromotionSettings model not found")
    }

    // Get the active promotion settings (there should only be one)
    const settings = await PromotionSettings.findOne({ isActive: true }).lean()

    const response = NextResponse.json({
      success: true,
      data: settings,
    })
    response.headers.set("Cache-Control", "public, s-maxage=1200, stale-while-revalidate=2400") // Cache for 20 minutes, stale for 40 minutes

    return response
  } catch (error) {
    console.error("Error fetching promotion settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch promotion settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const PromotionSettings = connection.models.PromotionSettings

    if (!PromotionSettings) {
      throw new Error("PromotionSettings model not found")
    }

    const body = await request.json()
    console.log("[v0] Creating/updating promotion settings with data:", {
      ...body,
      bannerImageData: body.bannerImageData ? "base64 data present" : "no base64 data",
    })

    const { videoId, bannerImageUrl, bannerImageData } = body

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "YouTube video ID is required",
        },
        { status: 400 },
      )
    }

    if (!bannerImageUrl && !bannerImageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Banner image is required. Please provide either bannerImageUrl or bannerImageData",
        },
        { status: 400 },
      )
    }

    // Delete all existing settings (to ensure only one exists)
    await PromotionSettings.deleteMany({})

    // Create new settings
    const settings = new PromotionSettings({
      videoId,
      bannerImageUrl: bannerImageUrl || "",
      bannerImageData: bannerImageData || "",
      isActive: true,
      updatedAt: new Date(),
    })

    const savedSettings = await settings.save()
    console.log("[v0] Promotion settings saved successfully")

    return NextResponse.json({
      success: true,
      data: savedSettings,
      message: "Promotion settings saved successfully",
    })
  } catch (error) {
    console.error("Error saving promotion settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save promotion settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const PromotionSettings = connection.models.PromotionSettings

    if (!PromotionSettings) {
      throw new Error("PromotionSettings model not found")
    }

    const body = await request.json()
    console.log("[v0] Updating promotion settings with data:", {
      ...body,
      bannerImageData: body.bannerImageData ? "base64 data present" : "no base64 data",
    })

    const { videoId, bannerImageUrl, bannerImageData } = body

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "YouTube video ID is required",
        },
        { status: 400 },
      )
    }

    // Delete all existing settings
    await PromotionSettings.deleteMany({})

    // Create new settings (effectively replacing the old one)
    const settings = new PromotionSettings({
      videoId,
      bannerImageUrl: bannerImageUrl || "",
      bannerImageData: bannerImageData || "",
      isActive: true,
      updatedAt: new Date(),
    })

    const savedSettings = await settings.save()
    console.log("[v0] Promotion settings updated successfully")

    return NextResponse.json({
      success: true,
      data: savedSettings,
      message: "Promotion settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating promotion settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update promotion settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
