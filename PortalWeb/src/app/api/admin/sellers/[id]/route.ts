import { NextResponse, type NextRequest } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function PATCH(request: NextRequest) {
  try {
    // Safely extract the 'id' from the route parameters
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    if (!["Approved", "Reject", "Review"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const db = await connectProfileDB()
    const ProfileProgress = db.models.ProfileProgress

    // Convert string ID to ObjectId
    let objectId
    try {
      objectId = new mongoose.Types.ObjectId(id)
    } catch (error) {
      return NextResponse.json({ error: "Invalid Seller ID format" }, { status: 400 })
    }

    // Find and update the profile progress based on userId
    const updatedProfile = await ProfileProgress.findOneAndUpdate(
      { userId: objectId.toString() }, // Use userId instead of _id
      { status },
      { new: true },
    )

    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Seller status updated successfully", updatedProfile })
  } catch (error) {
    console.error("Error updating seller status:", error)
    return NextResponse.json({ error: "Failed to update seller status" }, { status: 500 })
  }
}
