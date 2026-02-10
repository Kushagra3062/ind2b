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

    const { reason } = await request.json()

    // Connect to database
    const connection = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(connection)

    // Find and update the quotation request
    const quotationRequest = await QuotationRequest.findOneAndUpdate(
      {
        _id: params.id,
        userId: user.id, // Ensure customer can only reject their own quotations
        status: "responded", // Only allow rejecting responded quotes
      },
      {
        status: "rejected",
        rejectionReason: reason || "",
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!quotationRequest) {
      return NextResponse.json({ error: "Quotation request not found or cannot be rejected" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Quote rejected successfully",
      data: quotationRequest,
    })
  } catch (error) {
    console.error("Error rejecting quotation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
