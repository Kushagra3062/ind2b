import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    // Get user ID from session
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Connect to profile DB
    const connection = await connectProfileDB()

    // Define Contact schema if it doesn't exist
    if (!connection.models.Contact) {
      const ContactSchema = new mongoose.Schema(
        {
          userId: { type: String, required: true, index: true },
          contactName: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          emailId: { type: String, required: true },
          pickupTime: { type: String, required: true },
        },
        { timestamps: true },
      )

      connection.model("Contact", ContactSchema)
    }

    // Get Contact model
    const Contact = connection.models.Contact

    // Find contact details for the current user
    const contactDetails = await Contact.findOne({ userId: user.id })

    if (!contactDetails) {
      return NextResponse.json({ error: "Contact details not found" }, { status: 404 })
    }

    // Return the email
    return NextResponse.json({ email: contactDetails.emailId })
  } catch (error) {
    console.error("Error fetching seller email:", error)
    return NextResponse.json({ error: "Failed to fetch seller email" }, { status: 500 })
  }
}
