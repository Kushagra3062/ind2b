import { NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define the Cart schema (same as in route.ts)
interface CartItem {
  productId: string
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
        productId: { type: String, required: true },
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
const getCartModel = async () => {
  const connection = await connectProfileDB()
  try {
    return connection.model<Cart>("Cart")
  } catch (error) {
    return connection.model<Cart>("Cart", CartSchema)
  }
}

// GET handler - Fetch a specific item from the user's cart
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", item: null }, { status: 401 })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required", item: null }, { status: 400 })
    }

    const CartModel = await getCartModel()

    // Use lean() to get a plain JavaScript object
    const cart = await CartModel.findOne({ userId: user.id }).lean()

    if (!cart) {
      return NextResponse.json({ message: "Cart not found", item: null }, { status: 404 })
    }

    const item = cart.items.find((item) => item.productId === productId)
    if (!item) {
      return NextResponse.json({ message: "Item not found in cart", item: null }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Error fetching cart item:", error)
    return NextResponse.json({ message: "Failed to fetch cart item", item: null }, { status: 500 })
  }
}

// POST handler - Add an item to the user's cart
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", items: [] }, { status: 401 })
    }

    const item = await request.json()
    if (!item || !item.id || !item.title || !item.price) {
      return NextResponse.json({ message: "Invalid item data", items: [] }, { status: 400 })
    }

    // Process the item
    const processedItem = {
      productId: item.id, // Map 'id' to 'productId' for the database
      title: item.title,
      image_link: item.image_link,
      price: Number(item.price),
      discount: Number(item.discount || 0),
      units: item.units,
      quantity: Number(item.quantity || 1),
      stock: Number(item.stock || 0),
    }

    const CartModel = await getCartModel()

    // Check if the cart exists
    const existingCart = await CartModel.findOne({ userId: user.id }).lean()

    if (!existingCart) {
      // Create a new cart
      const newCart = new CartModel({
        userId: user.id,
        items: [processedItem],
      })
      await newCart.save()
    } else {
      // Check if the item already exists
      const existingItemIndex = existingCart.items.findIndex((i) => i.productId === processedItem.productId)

      if (existingItemIndex !== -1) {
        // Update existing item
        existingCart.items[existingItemIndex].quantity += processedItem.quantity

        // Ensure quantity doesn't exceed stock
        if (processedItem.stock > 0) {
          existingCart.items[existingItemIndex].quantity = Math.min(
            existingCart.items[existingItemIndex].quantity,
            processedItem.stock,
          )
        }

        // Update the cart
        await CartModel.updateOne({ userId: user.id }, { $set: { items: existingCart.items, updatedAt: new Date() } })
      } else {
        // Add new item
        await CartModel.updateOne(
          { userId: user.id },
          { $push: { items: processedItem }, $set: { updatedAt: new Date() } },
        )
      }
    }

    // Get the updated cart
    const updatedCart = await CartModel.findOne({ userId: user.id }).lean()
    return NextResponse.json({ items: updatedCart?.items || [] })
  } catch (error) {
    console.error("Error adding item to cart:", error)
    return NextResponse.json(
      { message: "Failed to add item to cart", error: String(error), items: [] },
      { status: 500 },
    )
  }
}

// PUT handler - Update an item in the user's cart
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", items: [] }, { status: 401 })
    }

    const { id, quantity } = await request.json()
    if (!id || typeof quantity !== "number") {
      return NextResponse.json({ message: "Invalid update data", items: [] }, { status: 400 })
    }

    const CartModel = await getCartModel()

    // Get the current cart
    const cart = await CartModel.findOne({ userId: user.id }).lean()

    if (!cart) {
      return NextResponse.json({ message: "Cart not found", items: [] }, { status: 404 })
    }

    // Find the item
    const itemIndex = cart.items.findIndex((item) => item.productId === id)

    if (itemIndex === -1) {
      return NextResponse.json({ message: "Item not found in cart", items: [] }, { status: 404 })
    }

    // Update the quantity
    cart.items[itemIndex].quantity = quantity

    // Update the cart
    await CartModel.updateOne({ userId: user.id }, { $set: { items: cart.items, updatedAt: new Date() } })

    // Get the updated cart
    const updatedCart = await CartModel.findOne({ userId: user.id }).lean()
    return NextResponse.json({ items: updatedCart?.items || [] })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { message: "Failed to update cart item", error: String(error), items: [] },
      { status: 500 },
    )
  }
}

// DELETE handler - Remove an item from the user's cart
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", items: [] }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Item ID is required", items: [] }, { status: 400 })
    }

    const CartModel = await getCartModel()

    // Get the current cart
    const cart = await CartModel.findOne({ userId: user.id }).lean()

    if (!cart) {
      return NextResponse.json({ message: "Cart not found", items: [] }, { status: 404 })
    }

    // Remove the item
    const updatedItems = cart.items.filter((item) => item.productId !== id)

    // Update the cart
    await CartModel.updateOne({ userId: user.id }, { $set: { items: updatedItems, updatedAt: new Date() } })

    // Get the updated cart
    const updatedCart = await CartModel.findOne({ userId: user.id }).lean()
    return NextResponse.json({ items: updatedCart?.items || [] })
  } catch (error) {
    console.error("Error removing item from cart:", error)
    return NextResponse.json(
      { message: "Failed to remove item from cart", error: String(error), items: [] },
      { status: 500 },
    )
  }
}
