import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const { userId, status } = await request.json()

    if (!userId || !status) {
      return NextResponse.json({ error: "User ID and status are required" }, { status: 400 })
    }

    if (!["Approved", "Reject", "Review"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be Approved, Reject, or Review" }, { status: 400 })
    }

    const db = await connectProfileDB()
    const ProfileProgress = db.model("ProfileProgress")

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId)

    // Update user type in the correct database
    const updatedUser = await ProfileProgress.findByIdAndUpdate(objectId, { status: status }, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "User status updated successfully",
      user: {
        id: updatedUser._id.toString(),
        status: updatedUser.status,
      },
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
