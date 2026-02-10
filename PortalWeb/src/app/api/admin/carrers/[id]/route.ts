import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id } = await params

    const connection = await connectProfileDB()
    const Career = connection.models.Career

    if (!Career) {
      throw new Error("Career model not found")
    }

    const updatedCareer = await Career.findByIdAndUpdate(id, body, { new: true }).lean()

    if (!updatedCareer) {
      return NextResponse.json(
        {
          success: false,
          error: "Career not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedCareer,
    })
  } catch (error) {
    console.error("Error updating career:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update career",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const connection = await connectProfileDB()
    const Career = connection.models.Career

    if (!Career) {
      throw new Error("Career model not found")
    }

    const deletedCareer = await Career.findByIdAndDelete(id)

    if (!deletedCareer) {
      return NextResponse.json(
        {
          success: false,
          error: "Career not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Career deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting career:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete career",
      },
      { status: 500 },
    )
  }
}
