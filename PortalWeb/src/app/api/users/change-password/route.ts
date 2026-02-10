import { type NextRequest, NextResponse } from "next/server"
import { connectDB1 } from "@/lib/db"
import { getUserModel } from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

export async function POST(req: NextRequest) {
  try {
    await connectDB1()
    const { currentPassword, newPassword } = await req.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new passwords are required" }, { status: 400 })
    }

    // Get the auth token from cookies
    const cookieStore = req.cookies
    const token = cookieStore.get("auth-token")

    if (!token || !token.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Decode the JWT token to get the user ID
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Fetch the user from the database
    const UserModel = await getUserModel()
    const user = await UserModel.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password in the database
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
