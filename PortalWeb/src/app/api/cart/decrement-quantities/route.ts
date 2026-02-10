import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Parse the request body
    const { orderedItems } = await request.json()

    if (!orderedItems || !Array.isArray(orderedItems)) {
      return NextResponse.json({ success: false, error: "Invalid ordered items data" }, { status: 400 })
    }

    console.log("Processing cart quantity decrements for:", orderedItems)

    // Connect to the profile database
    const profileConnection = await connectProfileDB()
    const CartModel = profileConnection.models.Cart

    if (!CartModel) {
      console.error("Cart model not found in PROFILE_DB")
      return NextResponse.json({ success: false, error: "Cart model not available" }, { status: 500 })
    }

    // Start a session for atomic operations
    const session = await profileConnection.startSession()

    try {
      await session.withTransaction(async () => {
        // Find user's cart
        const userCart = await CartModel.findOne({ userId: user.id }).session(session)

        if (!userCart || !userCart.items || userCart.items.length === 0) {
          console.log("No cart found or cart is empty for user:", user.id)
          return
        }

        let cartUpdated = false
        const updatedItems = []
        const removedItems = []

        // Process each cart item
        for (const cartItem of userCart.items) {
          // Find matching ordered item using product_id
          const orderedItem = orderedItems.find(
            (item) => item.productId === cartItem.productId || item.productId === cartItem.product_id,
          )

          if (orderedItem) {
            const newQuantity = cartItem.quantity - orderedItem.quantity

            if (newQuantity <= 0) {
              // Remove item completely if quantity becomes 0 or negative
              removedItems.push({
                product_id: cartItem.productId || cartItem.product_id,
                title: cartItem.title,
                removedQuantity: cartItem.quantity,
              })
              cartUpdated = true
            } else {
              // Update quantity
              cartItem.quantity = newQuantity
              updatedItems.push({
                product_id: cartItem.productId || cartItem.product_id,
                title: cartItem.title,
                previousQuantity: cartItem.quantity + orderedItem.quantity,
                newQuantity: newQuantity,
                decrementedBy: orderedItem.quantity,
              })
              cartUpdated = true
            }
          } else {
            // Keep item as is if not in ordered items
            updatedItems.push({
              product_id: cartItem.productId || cartItem.product_id,
              title: cartItem.title,
              quantity: cartItem.quantity,
              status: "unchanged",
            })
          }
        }

        if (cartUpdated) {
          // Filter out items with quantity <= 0
          userCart.items = userCart.items.filter((item: { productId: any; product_id: any; quantity: number }) => {
            const orderedItem = orderedItems.find(
              (ordered) => ordered.productId === item.productId || ordered.productId === item.product_id,
            )
            if (orderedItem) {
              const newQuantity = item.quantity - orderedItem.quantity
              return newQuantity > 0
            }
            return true
          })

          // Save the updated cart
          await userCart.save({ session })

          console.log("Cart updated successfully:", {
            updatedItems,
            removedItems,
            remainingItems: userCart.items.length,
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: "Cart quantities updated successfully",
        details: {
          totalItemsProcessed: orderedItems.length,
          cartUpdated: true,
        },
      })
    } catch (transactionError) {
      console.error("Transaction error:", transactionError)
      return NextResponse.json({ success: false, error: "Failed to update cart quantities" }, { status: 500 })
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error updating cart quantities:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update cart quantities" },
      { status: 500 },
    )
  }
}
