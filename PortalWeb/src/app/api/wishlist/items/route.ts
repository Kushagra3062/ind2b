import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { getCurrentUser } from "@/actions/auth"

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
              seller_id: { type: String },
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

// POST handler to add an item to the wishlist
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { item } = body

    // Validate the item
    if (!item || !item.productId || !item.title || !item.image_link || item.price === undefined) {
      return NextResponse.json({ success: false, error: "Invalid item data" }, { status: 400 })
    }

    // Process the item to ensure it has all required fields
    const processedItem = {
      productId: item.productId,
      title: item.title,
      image_link: item.image_link,
      price: Number(item.price),
      discount: item.discount ? Number(item.discount) : 0,
      seller_id: item.seller_id,
      stock: item.stock ? Number(item.stock) : 0,
      units: item.units,
      addedAt: new Date(),
    }

    // Get the Wishlist model
    const WishlistModel = await getWishlistModel()

    // Check if the item already exists in the wishlist
    const existingWishlist = await WishlistModel.findOne({
      userId: user.id,
      "items.productId": processedItem.productId,
    })

    if (existingWishlist) {
      // Item already exists, return success
      return NextResponse.json({ success: true, message: "Item already in wishlist" })
    }

    // Add the item to the wishlist
    const updatedWishlist = await WishlistModel.findOneAndUpdate(
      { userId: user.id },
      {
        $push: { items: processedItem },
        $set: { updatedAt: new Date() },
        $setOnInsert: { userId: user.id },
      },
      { new: true, upsert: true },
    )

    return NextResponse.json({ success: true, wishlist: updatedWishlist })
  } catch (error) {
    console.error("Error adding item to wishlist:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to add item to wishlist" },
      { status: 500 },
    )
  }
}

// DELETE handler to remove an item from the wishlist
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Get the product ID from the query parameters
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    // Get the Wishlist model
    const WishlistModel = await getWishlistModel()

    // Remove the item from the wishlist
    const updatedWishlist = await WishlistModel.findOneAndUpdate(
      { userId: user.id },
      {
        $pull: { items: { productId } },
        $set: { updatedAt: new Date() },
      },
      { new: true },
    )

    if (!updatedWishlist) {
      return NextResponse.json({ success: false, error: "Wishlist not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, wishlist: updatedWishlist })
  } catch (error) {
    console.error("Error removing item from wishlist:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to remove item from wishlist" },
      { status: 500 },
    )
  }
}
