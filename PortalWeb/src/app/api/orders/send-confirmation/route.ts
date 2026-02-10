import { NextResponse, type NextRequest } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { sendEmail } from "@/lib/email"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"
import type { Order } from "@/models/profile/order"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    // Connect to the database
    const conn = await connectProfileDB()
    const OrderModel = conn.models.Order

    // Find the order
    const order = await OrderModel.findById(orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Get the email from billing details
    const email = order.billingDetails?.email

    if (!email) {
      return NextResponse.json({ success: false, error: "No email address found for this order" }, { status: 400 })
    }

    // Generate the email HTML
    const htmlContent = generateOrderConfirmationEmail(order.toObject() as Order)

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: `Order Confirmation #${order._id}`,
      html: htmlContent,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent successfully",
    })
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
