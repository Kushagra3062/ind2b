import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting GET request for WhatsApp campaigns")

    // Verify admin authentication
    const user = await getCurrentUser()
    console.log("[v0] Current user:", user ? { id: user.id, type: user.type } : "No user")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const targetAudience = searchParams.get("targetAudience")

    console.log("[v0] Query params:", { page, limit, status, targetAudience })

    // Connect to database
    console.log("[v0] Connecting to profile database...")
    const connection = await connectProfileDB()
    console.log("[v0] Database connection established")

    const WhatsAppCampaign = connection.models.WhatsAppCampaign
    console.log("[v0] WhatsAppCampaign model available:", !!WhatsAppCampaign)

    if (!WhatsAppCampaign) {
      console.log("[v0] Available models:", Object.keys(connection.models))
      return NextResponse.json({ error: "WhatsAppCampaign model not available" }, { status: 500 })
    }

    // Build query filters
    const query: any = {}
    if (status && status !== "all") {
      query.status = status
    }
    if (targetAudience && targetAudience !== "all") {
      query.targetAudience = targetAudience
    }

    console.log("[v0] Query filters:", query)

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch campaigns with pagination
    console.log("[v0] Fetching campaigns from database...")
    const campaigns = await WhatsAppCampaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    console.log("[v0] Found campaigns:", campaigns.length)

    // Get total count for pagination
    const total = await WhatsAppCampaign.countDocuments(query)
    console.log("[v0] Total campaigns count:", total)

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching WhatsApp campaigns:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting POST request for WhatsApp campaigns")

    // Verify admin authentication
    const user = await getCurrentUser()
    console.log("[v0] Current user:", user ? { id: user.id, type: user.type } : "No user")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { title, description, messageTemplate, targetAudience, customerSegment, scheduledAt } = body

    const missingFields = []
    if (!title || title.trim() === "") missingFields.push("title")
    if (!description || description.trim() === "") missingFields.push("description")
    if (!messageTemplate || messageTemplate.trim() === "") missingFields.push("messageTemplate")
    if (!targetAudience || targetAudience.trim() === "") missingFields.push("targetAudience")

    console.log("[v0] Field validation:", {
      title: !!title,
      description: !!description,
      messageTemplate: !!messageTemplate,
      targetAudience: !!targetAudience,
    })
    console.log("[v0] Missing fields:", missingFields)

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
          receivedData: { title, description, messageTemplate, targetAudience },
        },
        { status: 400 },
      )
    }

    // Connect to database
    console.log("[v0] Connecting to profile database...")
    const connection = await connectProfileDB()
    console.log("[v0] Database connection established")

    const WhatsAppCampaign = connection.models.WhatsAppCampaign
    console.log("[v0] WhatsAppCampaign model available:", !!WhatsAppCampaign)

    if (!WhatsAppCampaign) {
      console.log("[v0] Available models:", Object.keys(connection.models))
      return NextResponse.json({ error: "WhatsAppCampaign model not available" }, { status: 500 })
    }

    // Create new campaign
    const campaign = new WhatsAppCampaign({
      title,
      description,
      messageTemplate,
      targetAudience,
      customerSegment: customerSegment || {},
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "scheduled" : "draft",
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      createdBy: user.id,
    })

    console.log("[v0] Saving new campaign...")
    const savedCampaign = await campaign.save()
    console.log("[v0] Campaign saved successfully")

    return NextResponse.json({
      success: true,
      data: savedCampaign,
      message: "Campaign created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating WhatsApp campaign:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
