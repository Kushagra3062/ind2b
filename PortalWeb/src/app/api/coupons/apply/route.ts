import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// POST - Apply a coupon and increment usage count
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode } = body

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Coupon = connection.models.Coupon

    // Find and increment usage count
    const coupon = await Coupon.findOneAndUpdate(
      { couponCode: couponCode.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true },
    )

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Coupon applied successfully" })
  } catch (error) {
    console.error("Error applying coupon:", error)
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 })
  }
}
