import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import getQuotationRequestModel from "@/models/profile/quotation"

export async function GET(request: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(connection)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // Build query
    const query: any = { sellerId: user.id }
    if (status && status !== "all") {
      query.status = status
    }

    // Get total count
    const total = await QuotationRequest.countDocuments(query)

    // Get quotation requests with pagination
    const quotationRequests = await QuotationRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const formattedRequests = quotationRequests.map((request) => ({
      _id: (request._id as string | { toString(): string }).toString(),
      productId: request.productId,
      productTitle: request.productTitle,
      userId: request.userId || null,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      requestedPrice: request.requestedPrice,
      message: request.message,
      status: request.status,
      sellerResponse: request.sellerResponse,
      sellerQuotedPrice: request.sellerQuotedPrice,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching quotation requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
