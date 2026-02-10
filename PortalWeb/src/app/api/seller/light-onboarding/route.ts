import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { getUserModel } from "@/models/user"
import { connectProfileDB } from "@/lib/profileDb"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting light onboarding process...")
    const user = await getCurrentUser()
    console.log("User found:", user ? "Yes" : "No")
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { businessName, gstNumber, address, categories } = await request.json()
    console.log("Form data received:", { businessName, gstNumber, address, categories })

    // Validate required fields
    if (!businessName || !gstNumber || !address || !categories || categories.length === 0) {
      console.log("Validation failed: Missing required fields")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate GST number format (15 characters)
    if (gstNumber.length !== 15) {
      console.log("Validation failed: GST number length")
      return NextResponse.json({ error: "GST number must be 15 characters" }, { status: 400 })
    }

    console.log("Updating user model...")
    const UserModel = await getUserModel()
    
    
    await UserModel.findByIdAndUpdate(user.id, {
      onboardingStatus: "light_completed",
      lightOnboardingData: {
        businessName,
        gstNumber,
        address,
        categories,
      },
    })
    console.log("User model updated successfully")

    console.log("Connecting to profile database...")
    const db = await connectProfileDB()
    console.log("Profile database connected")
    
    // Check if database is ready
    if (db.readyState !== 1) {
      console.log("Database not ready, waiting...")
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    console.log("Database ready state:", db.readyState)
    
    // Use the ProfileProgress model from the profile database
    const ProfileProgressModel = db.models.ProfileProgress
    console.log("ProfileProgress model ready")

    // Create profile progress record with "Pending Completion" status
    const newProgress = new ProfileProgressModel({
      userId: user.id,
      completedSteps: ["light_onboarding"], 
      currentStep: "business",
      status: "Pending Completion", 
    })

    console.log("Saving profile progress...")
    await newProgress.save()
    console.log("Profile progress saved successfully")

    return NextResponse.json({ 
      success: true, 
      message: "Light onboarding completed successfully" 
    })
  } catch (error) {
    console.error("Error in light onboarding:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error details:", errorMessage)
    console.error("Error stack:", errorStack)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorMessage 
    }, { status: 500 })
  }
}