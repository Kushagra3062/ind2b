import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"
import type mongoose from "mongoose"

// Define a type for the Advertisement document
interface AdvertisementDocument {
  _id: mongoose.Types.ObjectId | string
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: string
  position: string
  startDate?: Date | null
  endDate?: Date | null
  createdAt?: Date
  updatedAt?: Date
  [key: string]: any // For any additional fields
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { id } = params
    console.log("Fetching advertisement with ID:", id)

    const advertisement = (await Advertisement.findById(id).lean()) as AdvertisementDocument | null

    if (!advertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "Advertisement not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: advertisement,
    })
  } catch (error) {
    console.error("Error fetching advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch advertisement",
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
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { id } = params
    const body = await request.json()

    console.log("[v0] Updating advertisement with ID:", id)
    console.log("[v0] Update data received:", {
      ...body,
      imageData: body.imageData ? "base64 data present" : "no base64 data",
    })

    const updateData = {
      title: body.title || "",
      subtitle: body.subtitle || "",
      description: body.description || "",
      imageUrl: body.imageUrl || "",
      imageData: body.imageData || "",
      linkUrl: body.linkUrl || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: body.order || 1,
      deviceType: body.deviceType || "all",
      position: body.position || "all", // Ensure position is saved
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      updatedAt: new Date(),
    }

    console.log("[v0] Processed update data:", updateData)

    const updatedAdvertisement = (await Advertisement.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).lean()) as AdvertisementDocument | null

    if (!updatedAdvertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "Advertisement not found",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Advertisement updated successfully with position:", updatedAdvertisement.position)

    return NextResponse.json({
      success: true,
      data: updatedAdvertisement,
      message: "Advertisement updated successfully",
    })
  } catch (error) {
    console.error("Error updating advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update advertisement",
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
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { id } = params
    console.log("Deleting advertisement with ID:", id)

    const deletedAdvertisement = (await Advertisement.findByIdAndDelete(id).lean()) as AdvertisementDocument | null

    if (!deletedAdvertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "Advertisement not found",
        },
        { status: 404 },
      )
    }

    console.log(
      "Advertisement deleted successfully:",
      typeof deletedAdvertisement._id === "object" ? deletedAdvertisement._id.toString() : deletedAdvertisement._id,
    )

    return NextResponse.json({
      success: true,
      data: deletedAdvertisement,
      message: "Advertisement deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete advertisement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
