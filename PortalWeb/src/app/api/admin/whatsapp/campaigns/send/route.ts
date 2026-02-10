import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// WhatsApp service disabled - Twilio not configured
// import { whatsappService } from "@/lib/whatsapp-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] WhatsApp campaign send route called (service disabled)")

    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId } = body

    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json({ error: "Valid campaign ID is required" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const WhatsAppCampaign = connection.models.WhatsAppCampaign
    const WhatsAppCampaignLog = connection.models.WhatsAppCampaignLog
    const Contact = connection.models.Contact

    if (!WhatsAppCampaign || !WhatsAppCampaignLog || !Contact) {
      return NextResponse.json({ error: "Required database models not available" }, { status: 500 })
    }

    // Get campaign details
    const campaign = await WhatsAppCampaign.findById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign already sent" }, { status: 400 })
    }

    console.log("[v0] Getting all contacts with valid phone numbers")
    const allContacts = await Contact.find({
      phoneNumber: { $exists: true, $nin: [null, ""] },
    })

    let recipients = allContacts
      .map((contact) => ({
        phone: contact.phoneNumber,
        name: contact.contactName || contact.name || "Customer",
        email: contact.emailId,
        userId: contact.userId,
      }))
      .filter((recipient) => {
        if (!recipient.phone) return false
        const cleanPhone = recipient.phone.replace(/\D/g, "")
        return cleanPhone.length >= 10 && cleanPhone.length <= 15
      })

    if (campaign.targetAudience === "customers") {
      // For customers, try to get those with orders, but fallback to all if Order model not available
      try {
        const Order = connection.models.Order
        if (Order) {
          const usersWithOrders = await Order.find({}).distinct("userId")
          recipients = recipients.filter((r) => usersWithOrders.includes(r.userId))
        }
      } catch (error) {
        console.log("[v0] Order filtering failed, using all contacts:", error)
      }
    }

    console.log("[v0] Valid recipients found:", recipients.length)

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No valid recipients found" },
        { status: 400 }
      )
    }

    // Update campaign status
    await WhatsAppCampaign.findByIdAndUpdate(campaignId, { status: "sent" })

    const sentCount = 0
    let failedCount = 0

    console.log("[v0] Starting to send messages (service disabled)")

    for (const recipient of recipients.slice(0, 50)) {
      // Limit to 50 for testing
      try {
        // Simple message personalization
        const personalizedMessage = campaign.messageTemplate
          .replace(/\{name\}/g, recipient.name)
          .replace(/\{phone\}/g, recipient.phone)

        // Detect campaign type and extract additional details
        const campaignType = detectCampaignType(campaign.name, personalizedMessage)
        const productLink = extractProductLink(personalizedMessage)
        const offerCode = extractOfferCode(personalizedMessage)

        // Create log entry
        const logEntry = new WhatsAppCampaignLog({
          campaignId: campaignId,
          recipientPhone: recipient.phone,
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          messageContent: personalizedMessage,
          status: "failed",
          errorMessage: "WhatsApp service disabled - Twilio not configured",
        })

        console.log("[v0] WhatsApp service disabled - Twilio not configured")
        console.log("[v0] Campaign message would have been sent to:", recipient.phone)

        // Mark as failed since service is disabled
        failedCount++

        await logEntry.save()
      } catch (error) {
        console.error(`[v0] Error processing recipient ${recipient.phone}:`, error)
        failedCount++
      }
    }

    // Update campaign statistics
    await WhatsAppCampaign.findByIdAndUpdate(campaignId, {
      sentCount,
      deliveredCount: sentCount,
      failedCount,
      status: "sent",
    })

    console.log("[v0] Campaign completed. Stats:", { sentCount, failedCount })

    return NextResponse.json({
      success: true,
      message: "Campaign processed (WhatsApp service disabled - Twilio not configured)",
      data: {
        totalRecipients: Math.min(recipients.length, 50),
        sentCount,
        deliveredCount: sentCount,
        failedCount,
      },
    })
  } catch (error) {
    console.error("[v0] Error sending WhatsApp campaign:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Helper methods for campaign type detection and content extraction
function detectCampaignType(
  campaignName: string,
  message: string
): "product_launch" | "offer" | "update" | "general" {
  const lowerName = (campaignName || "").toLowerCase()
  const lowerMessage = (message || "").toLowerCase()

  if (lowerName.includes("launch") || lowerMessage.includes("new product") || lowerMessage.includes("launching")) {
    return "product_launch"
  }
  if (
    lowerName.includes("offer") ||
    lowerMessage.includes("discount") ||
    lowerMessage.includes("sale") ||
    lowerMessage.includes("%")
  ) {
    return "offer"
  }
  if (lowerName.includes("update") || lowerMessage.includes("announcement") || lowerMessage.includes("news")) {
    return "update"
  }
  return "general"
}

function extractProductLink(message: string): string | undefined {
  if (!message) return undefined
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = message.match(urlRegex)
  return matches ? matches[0] : undefined
}

function extractOfferCode(message: string): string | undefined {
  if (!message) return undefined
  const codeRegex = /(?:code|coupon|promo)[\s:]*([A-Z0-9]{3,15})/gi
  const matches = message.match(codeRegex)
  if (matches) {
    const code = matches[0].replace(/(?:code|coupon|promo)[\s:]*/gi, "")
    return code.toUpperCase()
  }
  return undefined
}
