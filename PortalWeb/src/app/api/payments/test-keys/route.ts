import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function GET() {
  try {
    // Get Razorpay API keys
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    // Check if keys are available
    if (!key_id || !key_secret) {
      return NextResponse.json({
        success: false,
        error: "Razorpay API keys are missing",
        keyIdExists: !!key_id,
        keySecretExists: !!key_secret,
      })
    }

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    })

    // Make a simple API call to verify keys are working
    // We'll just fetch a list of payments (limit 1) to check if the API works
    const result = await razorpay.payments.all({
      count: 1,
    })

    return NextResponse.json({
      success: true,
      message: "Razorpay API keys are valid",
      count: result.count,
    })
  } catch (error: any) {
    console.error("Error testing Razorpay keys:", error)

    return NextResponse.json({
      success: false,
      error: "Failed to validate Razorpay API keys",
      details: error.message || "Unknown error",
    })
  }
}
