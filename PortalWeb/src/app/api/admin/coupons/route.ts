import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

// GET - Fetch all coupons
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const connection = await connectProfileDB()
    const Coupon = connection.models.Coupon

    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ success: true, coupons })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      couponName,
      couponCode,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      isActive,
      usageLimit,
      minOrderValue,
      maxDiscountAmount,
    } = body

    // Validate required fields
    if (!couponName || !couponCode || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate discount value
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json({ error: "Percentage discount must be between 0 and 100" }, { status: 400 })
    }

    if (discountType === "fixed" && discountValue < 0) {
      return NextResponse.json({ error: "Fixed discount must be greater than 0" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Coupon = connection.models.Coupon

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      couponName,
      couponCode: couponCode.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: isActive !== undefined ? isActive : true,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usedCount: 0,
      minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
    })

    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}

// PUT - Update a coupon
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Coupon = connection.models.Coupon

    // If couponCode is being updated, check for duplicates
    if (updateData.couponCode) {
      const existingCoupon = await Coupon.findOne({
        couponCode: updateData.couponCode.toUpperCase(),
        _id: { $ne: id },
      })
      if (existingCoupon) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
      }
      updateData.couponCode = updateData.couponCode.toUpperCase()
    }

    // Convert date strings to Date objects
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom)
    }
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil)
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true })

    if (!updatedCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, coupon: updatedCoupon })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

// DELETE - Delete a coupon
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Coupon = connection.models.Coupon

    const deletedCoupon = await Coupon.findByIdAndDelete(id)

    if (!deletedCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
