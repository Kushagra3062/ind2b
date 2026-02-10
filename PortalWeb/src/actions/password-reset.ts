"use server"

import { getUserModel } from "@/models/user"
import bcrypt from "bcryptjs"

export async function verifyEmailForReset(email: string) {
  try {
    const UserModel = await getUserModel()
    const user = await UserModel.findOne({ email })

    if (!user) {
      return { error: "Email not found in our records" }
    }

    return {
      success: true,
      message: "Email verified successfully",
    }
  } catch (error) {
    console.error("Error in verifyEmailForReset:", error)
    return { error: "Something went wrong" }
  }
}

export async function resetPassword(email: string, newPassword: string) {
  try {
    const UserModel = await getUserModel()

    if (newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long" }
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)

    if (!hasLetter || !hasNumber || !hasSpecial) {
      return { error: "Password must contain letters, numbers, and special characters" }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    const user = await UserModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true })

    if (!user) {
      return { error: "User not found" }
    }

    return {
      success: true,
      message: "Password reset successfully",
    }
  } catch (error) {
    console.error("Error in resetPassword:", error)
    return { error: "Something went wrong" }
  }
}
