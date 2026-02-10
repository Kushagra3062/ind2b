import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { getCurrentUser } from "@/actions/auth"

// Interface for Wishlist items
interface WishlistItem {
  productId: string
  title: string
  image_link: string
  price: number
  discount?: number
  stock?: number
  units?: string
  addedAt?: Date
}

// Interface for Wishlist
interface Wishlist {
  userId: string
  items: WishlistItem[]
  updatedAt: Date
}

// Get Wishlist model
async function getWishlistModel() {
  const connection = await connectProfileDB()
  return (
    connection.models.Wishlist ||
    connection.model(
      "Wishlist",
      new mongoose.Schema(
        {
          userId: { type: String, required: true, index: true, unique: true },
          items: [
            {
              productId: { type: String, required: true },
              title: { type: String, required: true },
              image_link: { type: String, required: true },
              price: { type: Number, required: true },
              discount: { type: Number, default: 0 },
              stock: { type: Number, default: 0 },
              units: { type: String },
              addedAt: { type: Date, default: Date.now },
            },
          ],
          updatedAt: { type: Date, default: Date.now },
        },
        { timestamps: true },
      ),
    )
  )
}

// GET handler to retrieve the user's wishlist
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Get the Wishlist model
    const WishlistModel = await getWishlistModel()

    // Find the user's wishlist
    const wishlist = await WishlistModel.findOne({ userId: user.id }).lean()

    if (!wishlist) {
      // Return an empty wishlist if none exists
      return NextResponse.json({ success: true, wishlist: { userId: user.id, items: [] } })
    }

    return NextResponse.json({ success: true, wishlist })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch wishlist" },
      { status: 500 },
    )
  }
}

// POST handler to update the user's wishlist
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { items } = body

    // Validate the items
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid wishlist items format" }, { status: 400 })
    }

    // Process the items to ensure they have all required fields
    const processedItems = items.map((item: any) => ({
      productId: item.productId || item.id,
      title: item.title,
      image_link: item.image_link,
      price: Number(item.price),
      discount: item.discount ? Number(item.discount) : 0,
      stock: item.stock ? Number(item.stock) : 0,
      units: item.units,
      addedAt: item.addedAt || new Date(),
    }))

    // Get the Wishlist model
    const WishlistModel = await getWishlistModel()

    // Update or create the wishlist
    const updatedWishlist = await WishlistModel.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        items: processedItems,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    )

    return NextResponse.json({ success: true, wishlist: updatedWishlist })
  } catch (error) {
    console.error("Error updating wishlist:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update wishlist" },
      { status: 500 },
    )
  }
}

// DELETE handler to clear the user's wishlist
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Get the Wishlist model
    const WishlistModel = await getWishlistModel()

    // Delete the user's wishlist
    await WishlistModel.findOneAndUpdate({ userId: user.id }, { $set: { items: [] } }, { new: true })

    return NextResponse.json({ success: true, message: "Wishlist cleared successfully" })
  } catch (error) {
    console.error("Error clearing wishlist:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to clear wishlist" },
      { status: 500 },
    )
  }
}
