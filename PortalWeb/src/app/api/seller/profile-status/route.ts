import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to profile database
    const db = await connectProfileDB()
    
    // Define ProfileProgress schema
    const ProfileProgressSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, index: true },
        completedSteps: [{ type: String, required: true }],
        currentStep: { type: String, required: true },
        status: {
          type: String,
          enum: [ "Pending Completion", "Approved", "Reject", "Review", ],
          default: "Pending Completion",
        },
      },
      { timestamps: true },
    )

    const ProfileProgress = db.models.ProfileProgress || db.model("ProfileProgress", ProfileProgressSchema)

    // Find profile progress for this user
    const progress = await ProfileProgress.findOne({ userId: user.id })

    if (!progress) {
      return NextResponse.json({ 
        status: "Pending Completion",
        message: "No profile progress found" 
      })
    }

    return NextResponse.json({ 
      status: progress.status,
      completedSteps: progress.completedSteps,
      currentStep: progress.currentStep
    })
  } catch (error) {
    console.error("Error checking profile status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
