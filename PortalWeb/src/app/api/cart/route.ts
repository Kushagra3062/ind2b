import { NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose, { type Model } from "mongoose"

// Define the Cart schema and interface
interface CartItem {
  id: string
  title: string
  image_link?: string
  price: number
  discount: number
  units?: string
  quantity: number
  stock: number
}

interface Cart {
  userId: string
  items: CartItem[]
  updatedAt: Date
}

const CartSchema = new mongoose.Schema<Cart>(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        image_link: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        units: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        stock: { type: Number, default: 0 },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Get or create the Cart model
const getCartModel = async (): Promise<Model<Cart>> => {
  const connection = await connectProfileDB()
  try {
    return connection.model<Cart>("Cart")
  } catch (error) {
    return connection.model<Cart>("Cart", CartSchema)
  }
}

// GET handler - Fetch user's cart
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", items: [] }, { status: 401 })
    }

    const CartModel = await getCartModel()

    // Use userId instead of user_id
    const cart = await CartModel.findOne({ userId: user.id }).lean()

    if (!cart) {
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({ items: cart.items })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ message: "Failed to fetch cart", items: [] }, { status: 500 })
  }
}

// POST handler - Update user's cart
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", items: [] }, { status: 401 })
    }

    const { items } = await request.json()

    // Validate items before saving
    if (!Array.isArray(items)) {
      return NextResponse.json({ message: "Items must be an array", items: [] }, { status: 400 })
    }

    // Process items to ensure they match the schema
    const processedItems = items.map((item) => ({
      id: item.id || item.productId,
      title: item.title,
      image_link: item.image_link,
      price: Number(item.price),
      discount: Number(item.discount || 0),
      units: item.units,
      quantity: Number(item.quantity || 1),
      stock: Number(item.stock || 0),
    }))

    const CartModel = await getCartModel()

    // Check if cart exists
    const existingCart = await CartModel.findOne({ userId: user.id }).lean()

    if (existingCart) {
      // Update existing cart
      await CartModel.updateOne({ userId: user.id }, { $set: { items: processedItems, updatedAt: new Date() } })
    } else {
      // Create new cart
      const newCart = new CartModel({
        userId: user.id,
        items: processedItems,
      })
      await newCart.save()
    }

    // Get updated cart
    const updatedCart = await CartModel.findOne({ userId: user.id }).lean()
    return NextResponse.json({ items: updatedCart?.items || [] })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ message: "Failed to update cart", error: String(error), items: [] }, { status: 500 })
  }
}

// DELETE handler - Clear user's cart
export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    const CartModel = await getCartModel()

    // Use userId instead of user_id
    await CartModel.updateOne({ userId: user.id }, { $set: { items: [], updatedAt: new Date() } })

    return NextResponse.json({ message: "Cart cleared successfully", success: true })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ message: "Failed to clear cart", success: false }, { status: 500 })
  }
}
