import { type NextRequest, NextResponse } from "next/server"
import { connectDB1 } from "@/lib/db"
import { getUserModel } from "@/models/user"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "seller", "customer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be admin, seller, or customer" }, { status: 400 })
    }

    // Use connectDB1 to ensure we're using the same database as login/signup
    await connectDB1()

    // Get the User model with the correct connection
    const UserModel = await getUserModel()

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId)

    // Update user type in the correct database
    const updatedUser = await UserModel.findByIdAndUpdate(objectId, { type: role }, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.type,
      },
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}
