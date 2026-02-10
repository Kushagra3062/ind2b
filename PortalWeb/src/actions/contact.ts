"use server"

import { Resend } from "resend"
import { connectProfileDB } from "@/lib/profileDb"

const resend = new Resend(process.env.RESEND_API_KEY)

const IS_PRODUCTION = process.env.NODE_ENV === "production"
const FROM_EMAIL = IS_PRODUCTION
  ? "Your Company <contact@yourdomain.com>" // Replace with your verified domain
  : "Acme <onboarding@resend.dev>"
const TO_EMAIL = "ranjeshroy97099@gmail.com" // Always use your verified email for now

interface ContactFormData {
  name: string
  email: string
  phone?: string
  queryType: string
  orderId?: string
  message: string
}

export async function sendContactEmail(data: ContactFormData) {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.queryType || !data.message) {
      return { success: false, error: "Required fields are missing" }
    }

    // Connect to database and save message
    const connection = await connectProfileDB()
    const Message = connection.models.Message

    // Determine priority based on query type
    let priority = "medium"
    if (data.queryType === "order-issue" || data.queryType === "payment-issue") {
      priority = "high"
    } else if (data.queryType === "return-refund") {
      priority = "urgent"
    } else if (data.queryType === "general-inquiry" || data.queryType === "feedback") {
      priority = "low"
    }

    // Save message to database
    const newMessage = new Message({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      queryType: data.queryType,
      orderId: data.orderId?.trim() || null,
      message: data.message.trim(),
      status: "new",
      priority: priority,
    })

    const savedMessage = await newMessage.save()
    console.log("Message saved to database:", savedMessage._id)

    // Send email notification (if RESEND_API_KEY is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const { data: emailData, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [TO_EMAIL],
          replyTo: data.email,
          subject: `IND2B Contact Submission - ${data.queryType || "General Query"} [ID: ${savedMessage._id}]`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #FF5C00;">New Contact Form Submission</h2>
              <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <p><strong>Message ID:</strong> ${savedMessage._id}</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
                <p><strong>Query Type:</strong> ${data.queryType}</p>
                <p><strong>Order ID:</strong> ${data.orderId || "Not provided"}</p>
                <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 4px;">${data.message}</p>
              </div>
              <p style="color: #666; font-size: 12px;">This message has been saved to the database and is ready for follow-up.</p>
            </div>
          `,
        })

        if (error) {
          console.error("Resend API error:", error)
          // Don't fail the entire operation if email fails, since we saved to DB
        } else {
          console.log("Email sent successfully:", emailData)
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        // Continue - email failure shouldn't fail the entire operation
      }
    }

    return {
      success: true,
      data: {
        messageId: savedMessage._id,
        message: "Your message has been sent successfully! Our team will get back to you soon.",
      },
    }
  } catch (error) {
    console.error("Error in sendContactEmail:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}

// Legacy function for backward compatibility with FormData
export async function sendContactEmailFormData(formData: FormData) {
  const data: ContactFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    queryType: formData.get("queryType") as string,
    orderId: formData.get("orderId") as string,
    message: formData.get("description") as string,
  }

  return sendContactEmail(data)
}
