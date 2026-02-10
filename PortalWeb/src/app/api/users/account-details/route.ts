import { type NextRequest, NextResponse } from "next/server"
import { getUserModel } from "@/models/user"
import { connectDB1 } from "@/lib/db"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

export async function GET(req: NextRequest) {
  try {
    await connectDB1()

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
    const user = await UserModel.findById(userId).select("-password") // Exclude the password field

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return the user data
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB1()

    const { fullName, email, secondaryEmail, phoneNumber, country, state, zipCode } = await req.json()

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

    // Update user details
    user.name = fullName || user.name
    user.email = email || user.email
    user.secondaryEmail = secondaryEmail || user.secondaryEmail
    user.phoneNumber = phoneNumber || user.phoneNumber
    user.country = country || user.country
    user.state = state || user.state
    user.zipCode = zipCode || user.zipCode

    await user.save()

    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
