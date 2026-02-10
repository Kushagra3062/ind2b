"use server"

import { connectProfileDB } from "@/lib/profileDb"

export async function submitFeedback(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const category = formData.get("category") as string
    const message = formData.get("message") as string
    const emoji = Number.parseInt(formData.get("emoji") as string)
    const vibeLabel = formData.get("vibeLabel") as string
    const vibeValue = formData.get("vibeValue") as string

    // Validate required fields
    if (!name || !email || !category || !message || emoji === null || !vibeLabel || !vibeValue) {
      return { success: false, error: "All fields are required" }
    }

    // Validate emoji range
    if (emoji < 0 || emoji > 5) {
      return { success: false, error: "Invalid emoji selection" }
    }

    // Connect to database
    const connection = await connectProfileDB()
    const Feedback = connection.models.Feedback

    // Create new feedback document
    const feedbackData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category,
      message: message.trim(),
      emoji,
      vibeLabel,
      vibeValue,
    }

    const feedback = new Feedback(feedbackData)
    await feedback.save()

    console.log("Feedback saved successfully:", feedback._id)

    return {
      success: true,
      message: "Thanks for your feedback! You're a real one. ✨",
      feedbackId: feedback._id,
    }
  } catch (error) {
    console.error("Error saving feedback:", error)
    return {
      success: false,
      error: "Failed to save feedback. Please try again.",
    }
  }
}
