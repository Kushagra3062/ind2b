import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectToProfileDB } from "@/lib/mongodb"
import getQuotationRequestModel from "@/models/profile/quotation"

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const connection = await connectToProfileDB()
    const QuotationRequest = getQuotationRequestModel(connection)

    // Fetch quotations for the current user
    const quotations = await QuotationRequest.find({
      userId: currentUser.id,
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      quotations: quotations || [],
    })
  } catch (error) {
    console.error("Error fetching customer quotations:", error)
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}
