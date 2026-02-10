import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const { db } = await connectProfileDB()
    const collection = db.collection("applicants")

    // Build search query
    const query: any = {}
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { careerTitle: { $regex: search, $options: "i" } },
        { collegeName: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ]
    }

    const total = await collection.countDocuments(query)
    const items = await collection
      .find(query)
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((item) => ({
          ...item,
          _id: item._id.toString(),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching applicants:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch applicants" }, { status: 500 })
  }
}
