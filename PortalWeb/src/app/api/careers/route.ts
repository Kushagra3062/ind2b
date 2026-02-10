import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Careers API called")

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Career = connection.models.Career

    if (!Career) {
      console.error("[v0] Career model not found")
      throw new Error("Career model not found")
    }

    console.log("[v0] Fetching active careers...")

    // Fetch all active careers
    const careers = await Career.find({ isActive: true }).sort({ createdAt: -1 }).lean()

    console.log("[v0] Found careers:", careers.length)

    return NextResponse.json({
      success: true,
      data: careers,
    })
  } catch (error) {
    console.error("[v0] Error fetching careers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch careers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
