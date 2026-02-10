import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const isActive = searchParams.get("isActive")
    const type = searchParams.get("type")

    const connection = await connectProfileDB()
    const Career = connection.models.Career

    if (!Career) {
      throw new Error("Career model not found")
    }

    // Build filter
    const filter: any = {}
    if (isActive !== null && isActive !== "") {
      filter.isActive = isActive === "true"
    }
    if (type) {
      filter.type = type
    }

    // Get total count
    const total = await Career.countDocuments(filter)

    // Fetch paginated careers
    const careers = await Career.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        items: careers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching careers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch careers",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const connection = await connectProfileDB()
    const Career = connection.models.Career

    if (!Career) {
      throw new Error("Career model not found")
    }

    const newCareer = await Career.create(body)

    return NextResponse.json({
      success: true,
      data: newCareer,
    })
  } catch (error) {
    console.error("Error creating career:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create career",
      },
      { status: 500 },
    )
  }
}
