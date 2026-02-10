import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// POST - Validate a coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode, orderValue } = body

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    if (!orderValue || orderValue <= 0) {
      return NextResponse.json({ error: "Valid order value is required" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Coupon = connection.models.Coupon

    // Find the coupon
    const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() })

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 })
    }

    // Check validity dates
    const now = new Date()
    if (now < new Date(coupon.validFrom)) {
      return NextResponse.json({ error: "This coupon is not yet valid" }, { status: 400 })
    }

    if (now > new Date(coupon.validUntil)) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 })
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order value of ₹${coupon.minOrderValue.toFixed(2)} required for this coupon`,
        },
        { status: 400 },
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === "percentage") {
      discountAmount = (orderValue * coupon.discountValue) / 100
    } else {
      discountAmount = coupon.discountValue
    }

    // Apply max discount limit if set
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount
    }

    // Ensure discount doesn't exceed order value
    if (discountAmount > orderValue) {
      discountAmount = orderValue
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.couponCode,
        name: coupon.couponName,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
