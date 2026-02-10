import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const WhatsAppCampaign = connection.models.WhatsAppCampaign

    if (!WhatsAppCampaign) {
      return NextResponse.json({ error: "WhatsAppCampaign model not available" }, { status: 500 })
    }

    const campaign = await WhatsAppCampaign.findById(id).lean()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    })
  } catch (error) {
    console.error("Error fetching WhatsApp campaign:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const WhatsAppCampaign = connection.models.WhatsAppCampaign

    if (!WhatsAppCampaign) {
      return NextResponse.json({ error: "WhatsAppCampaign model not available" }, { status: 500 })
    }

    // Update campaign
    const updatedCampaign = await WhatsAppCampaign.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: "Campaign updated successfully",
    })
  } catch (error) {
    console.error("Error updating WhatsApp campaign:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = params

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const WhatsAppCampaign = connection.models.WhatsAppCampaign

    if (!WhatsAppCampaign) {
      return NextResponse.json({ error: "WhatsAppCampaign model not available" }, { status: 500 })
    }

    const deletedCampaign = await WhatsAppCampaign.findByIdAndDelete(id)

    if (!deletedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting WhatsApp campaign:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
