import { connectProfileDB } from "@/lib/profileDb"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      console.log("[v0] Invalid email format - missing or wrong type")
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("[v0] Invalid email format - regex failed for:", email)
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    console.log("[v0] Connecting to PROFILE_DB for email:", email)
    const connection = await connectProfileDB()
    console.log("[v0] Connected successfully. Available models:", Object.keys(connection.models))
    
    const Newsletter = connection.model("Newsletter")

    if (!Newsletter) {
      console.error("[v0] Newsletter model not found in PROFILE_DB")
      return NextResponse.json(
        { error: "Service error. Please try again later." },
        { status: 500 }
      )
    }

    console.log("[v0] Checking for existing subscriber:", email)
    const existingSubscriber = await Newsletter.findOne({ 
      email: email.toLowerCase() 
    })

    if (existingSubscriber) {
      console.log("[v0] Email already subscribed:", email)
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 409 }
      )
    }

    console.log("[v0] Creating new subscriber:", email)
    const newSubscriber = await Newsletter.create({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      isActive: true,
    })

    console.log("[v0] Successfully created subscriber:", newSubscriber._id)

    return NextResponse.json(
      { message: "Thanks for subscribing newsletter" },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[v0] Subscribe error - Full error object:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    })

    if (error.code === 11000) {
      console.log("[v0] Duplicate key error for email subscription")
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 409 }
      )
    }

    if (error.name === "ValidationError") {
      console.log("[v0] Validation error:", error.message)
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    )
  }
}
