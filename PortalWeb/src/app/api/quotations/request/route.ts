import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import getQuotationRequestModel from "@/models/profile/quotation"
import { getCurrentUser } from "@/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productTitle, sellerId, customerName, customerEmail, customerPhone, requestedPrice, message } =
      body

    console.log("[v0] Getting current user...")
    const currentUser = await getCurrentUser()
    console.log("[v0] Current user:", currentUser)

    // Validate required fields
    if (
      !productId ||
      !productTitle ||
      !sellerId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !requestedPrice
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number (basic validation)
    if (customerPhone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Validate price
    if (requestedPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(connection)

    const quotationRequestData: any = {
      productId,
      productTitle,
      sellerId,
      customerName,
      customerEmail,
      customerPhone,
      requestedPrice,
      message: message || "",
      status: "pending",
    }

    if (currentUser && currentUser.id) {
      quotationRequestData.userId = currentUser.id
      console.log("[v0] Adding userId to quotation request:", currentUser.id)
    } else {
      console.log("[v0] No current user found, quotation will be saved without userId")
    }

    console.log("[v0] Quotation request data before saving:", quotationRequestData)

    const quotationRequest = new QuotationRequest(quotationRequestData)
    const savedQuotation = await quotationRequest.save()

    console.log("[v0] Saved quotation request:", {
      id: savedQuotation._id,
      userId: savedQuotation.userId,
      status: savedQuotation.status,
    })

    return NextResponse.json({
      success: true,
      message: "Quotation request sent successfully",
      data: {
        id: savedQuotation._id,
        status: savedQuotation.status,
        userId: savedQuotation.userId || null,
      },
    })
  } catch (error) {
    console.error("Error creating quotation request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
