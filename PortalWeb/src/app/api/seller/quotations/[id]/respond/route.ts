import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import getQuotationRequestModel from "@/models/profile/quotation"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { quotedPrice, response } = await request.json()

    if (!quotedPrice || quotedPrice <= 0) {
      return NextResponse.json({ error: "Valid quoted price is required" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(connection)

    // Find and update the quotation request
    const quotationRequest = await QuotationRequest.findOneAndUpdate(
      {
        _id: params.id,
        sellerId: user.id, // Ensure seller can only update their own quotations
      },
      {
        status: "responded",
        sellerQuotedPrice: quotedPrice,
        sellerResponse: response || "",
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!quotationRequest) {
      return NextResponse.json({ error: "Quotation request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Quote sent successfully",
      data: quotationRequest,
    })
  } catch (error) {
    console.error("Error responding to quotation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
