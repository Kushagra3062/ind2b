import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import getQuotationRequestModel from "@/models/profile/quotation"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    console.log("Fetching quotation requests from profile database")
    const db = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(db)

    // Build query filters
    const query: any = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      query.$or = [
        { productTitle: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ]
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Fetch quotation requests with pagination
    const [quotations, total] = await Promise.all([
      QuotationRequest.find(query).sort(sort).skip(skip).limit(limit).lean(),
      QuotationRequest.countDocuments(query),
    ])

    // Get statistics
    const statistics = await QuotationRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const stats = {
      total: total,
      pending: statistics.find((s) => s._id === "pending")?.count || 0,
      responded: statistics.find((s) => s._id === "responded")?.count || 0,
      accepted: statistics.find((s) => s._id === "accepted")?.count || 0,
      rejected: statistics.find((s) => s._id === "rejected")?.count || 0,
    }

    const totalPages = Math.ceil(total / limit)

    console.log(`Found ${quotations.length} quotation requests`)

    return NextResponse.json({
      success: true,
      data: quotations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      statistics: stats,
    })
  } catch (error) {
    console.error("Error fetching quotation requests:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch quotation requests" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { quotationId, status, adminNotes } = await request.json()

    if (!quotationId || !status) {
      return NextResponse.json({ success: false, error: "Quotation ID and status are required" }, { status: 400 })
    }

    const db = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(db)

    const updatedQuotation = await QuotationRequest.findByIdAndUpdate(
      quotationId,
      {
        status,
        adminNotes,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedQuotation) {
      return NextResponse.json({ success: false, error: "Quotation request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedQuotation,
      message: "Quotation status updated successfully",
    })
  } catch (error) {
    console.error("Error updating quotation status:", error)
    return NextResponse.json({ success: false, error: "Failed to update quotation status" }, { status: 500 })
  }
}
