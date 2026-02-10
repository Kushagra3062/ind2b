import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days
    const campaignId = searchParams.get("campaignId")

    // Connect to database
    const connection = await connectProfileDB()
    const WhatsAppCampaign = connection.models.WhatsAppCampaign
    const WhatsAppCampaignLog = connection.models.WhatsAppCampaignLog

    if (!WhatsAppCampaign || !WhatsAppCampaignLog) {
      return NextResponse.json({ error: "Required models not available" }, { status: 500 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // Build query for campaigns
    const campaignQuery: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    }

    if (campaignId) {
      campaignQuery._id = campaignId
    }

    // Get campaign statistics
    const campaigns = await WhatsAppCampaign.find(campaignQuery)
    const totalCampaigns = campaigns.length
    const activeCampaigns = campaigns.filter((c) => c.status === "scheduled" || c.status === "draft").length
    const sentCampaigns = campaigns.filter((c) => c.status === "sent").length

    // Calculate totals
    const totalSent = campaigns.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0)
    const totalDelivered = campaigns.reduce((sum, campaign) => sum + (campaign.deliveredCount || 0), 0)
    const totalFailed = campaigns.reduce((sum, campaign) => sum + (campaign.failedCount || 0), 0)

    // Calculate delivery rate
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : "0"

    // Get recent campaign performance
    const recentCampaigns = await WhatsAppCampaign.find(campaignQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status sentCount deliveredCount failedCount createdAt")

    // Get daily statistics for the period
    const dailyStats = await WhatsAppCampaignLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCampaigns,
          activeCampaigns,
          sentCampaigns,
          totalSent,
          totalDelivered,
          totalFailed,
          deliveryRate: Number.parseFloat(deliveryRate),
        },
        recentCampaigns,
        dailyStats,
        period: Number.parseInt(period),
      },
    })
  } catch (error) {
    console.error("Error fetching WhatsApp analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
