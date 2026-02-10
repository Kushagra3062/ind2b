import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { amount, currency = "INR", receipt, notes } = body

    console.log("Received order creation request:", { amount, currency, receipt })

    // Validate required fields
    if (!amount) {
      console.error("Amount is required but not provided")
      return NextResponse.json({ success: false, error: "Amount is required" }, { status: 400 })
    }

    // Validate API keys
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      console.error("Razorpay API keys missing:", { key_id: !!key_id, key_secret: !!key_secret })
      return NextResponse.json({ success: false, error: "Payment gateway configuration error" }, { status: 500 })
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    // For INR, 1 rupee = 100 paise
    const amountInPaise = Math.round(amount * 100)

    console.log("Creating Razorpay order with:", {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      has_notes: !!notes,
    })

    // Initialize Razorpay instance with API keys
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    })

    // Create a new order
    try {
      const orderData = {
        amount: amountInPaise,
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {
          description: "Order payment",
        },
      }

      console.log("Sending order request to Razorpay:", orderData)

      const order = await razorpay.orders.create(orderData)

      console.log("Razorpay order created successfully:", {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      })

      // Return the order details
      return NextResponse.json({
        success: true,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      })
    } catch (razorpayError: any) {
      console.error("Razorpay API error:", razorpayError)
      console.error("Error details:", razorpayError.error || razorpayError.message || "Unknown error")

      // Return detailed error for debugging
      return NextResponse.json(
        {
          success: false,
          error: "Error creating Razorpay order",
          details: razorpayError.error || razorpayError.message || "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in create-order route:", error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
