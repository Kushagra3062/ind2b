import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const { messageId, status, priority } = await request.json()

    if (!messageId) {
      return NextResponse.json({ success: false, error: "Message ID is required" }, { status: 400 })
    }

    // Get database connection
    const connection = await connectProfileDB()
    const db = connection.db
    
    if (!db) {
      throw new Error("Database connection failed")
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) {
      updateData.status = status
    }

    if (priority) {
      updateData.priority = priority
    }
     {/*
    const result = await db.collection("messages").updateOne(
      { _id: new ObjectId(messageId) },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    } */}

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
    })
  } catch (error) {
    console.error("Error updating message status:", error)
    return NextResponse.json({ success: false, error: "Failed to update message status" }, { status: 500 })
  }
}
