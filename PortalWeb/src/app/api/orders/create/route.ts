import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"
import { sendEmail } from "@/lib/email"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"
import { getDisplayPrice } from "@/lib/price-helper" // Import price helper
// import { whatsappService } from "@/lib/whatsapp-service"
import type { Order } from "@/models/profile/order"

// Define interface for product data from database
interface ProductData {
  _id: any
  product_id: string
  seller_id: string
  title?: string
  price?: number
  final_price?: number // Include final_price in interface
  [key: string]: any
}

// Define interface for saved order data
interface SavedOrderData {
  _id: any
  userId: string
  products: Array<{
    productId: string
    product_id: string
    seller_id: string
    title: string
    quantity: number
    price: number
    image_link?: string
  }>
  [key: string]: any
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Parse the request body
    const orderData = await request.json()

    console.log("Incoming products:", JSON.stringify(orderData.products, null, 2))

    // Connect to the profile database
    const profileConnection = await connectProfileDB()
    const ProductModel = profileConnection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ success: false, error: "Product model not available" }, { status: 500 })
    }

    // Enhance products with seller information
    const enhancedProducts = await Promise.all(
      orderData.products.map(async (product: any) => {
        try {
          // Extract product_id from URL path or use direct ID
          let product_id = product.productId || product.id || product._id

          // If productId is a URL path like "/product/14", extract the ID
          if (typeof product_id === "string" && product_id.includes("/product/")) {
            product_id = product_id.split("/product/")[1]
          }

          console.log(`Looking up product with product_id: ${product_id}`)

          // Fetch seller_id using product_id
          let seller_id = "unknown-seller"
          let final_price = 0 // Initialize final_price variable

          try {
            const productDetails = (await ProductModel.findOne({ product_id: product_id }).lean()) as ProductData | null

            if (productDetails) {
              console.log(`Found product:`, productDetails)
              seller_id = productDetails.seller_id || "unknown-seller"
              final_price = productDetails.final_price || 0
              console.log(
                `Retrieved seller_id: ${seller_id} and final_price: ${final_price} for product_id: ${product_id}`,
              )
            } else {
              console.warn(`Product not found with product_id: ${product_id}`)
            }
          } catch (dbError) {
            console.error(`Database error for product_id ${product_id}:`, dbError)
          }

          const displayPrice = getDisplayPrice(product.price || 0, final_price)

          // Ensure all required fields are included
          const enhancedProduct = {
            productId: product_id,
            product_id: product_id,
            seller_id: seller_id,
            title: product.title || "Unknown Product",
            quantity: Number(product.quantity) || 1,
            price: Number(displayPrice) || 0, // Use display price
            image_link: product.image_link || product.image || null,
          }

          console.log(`Enhanced product:`, enhancedProduct)
          return enhancedProduct
        } catch (error) {
          console.error("Error processing product:", error)
          return {
            productId: product.productId || product.id || `fallback-${Date.now()}`,
            product_id: product.productId || product.id || `fallback-${Date.now()}`,
            seller_id: "unknown-seller",
            title: product.title || "Unknown Product",
            quantity: Number(product.quantity) || 1,
            price: Number(product.price) || 0,
            image_link: product.image_link || product.image || null,
          }
        }
      }),
    )

    console.log("All enhanced products:", JSON.stringify(enhancedProducts, null, 2))

    // Prepare order data
    const orderToSave = {
      ...orderData,
      userId: user.id,
      products: enhancedProducts,
      status: orderData.status ? orderData.status.toUpperCase() : "PENDING",
      createdAt: new Date(),
    }

    console.log("Order data to save:", JSON.stringify(orderToSave, null, 2))

    // Create and save order
    const OrderModel = profileConnection.models.Order
    const newOrder = new OrderModel(orderToSave)
    await newOrder.save()

    console.log("Order created successfully with ID:", newOrder._id)

    // Log the saved order to verify fields
    try {
      const savedOrder = (await OrderModel.findById(newOrder._id).lean()) as SavedOrderData | null
      if (savedOrder && savedOrder.products) {
        console.log("Saved order products:", JSON.stringify(savedOrder.products, null, 2))
      } else {
        console.log("No products found in saved order")
      }
    } catch (verifyError) {
      console.error("Error verifying saved order:", verifyError)
    }

    // Decrement cart quantities
    try {
      const orderedItems = enhancedProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      }))

      const cartResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cart/decrement-quantities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("Cookie") || "",
          },
          body: JSON.stringify({ orderedItems }),
        },
      )

      if (cartResponse.ok) {
        console.log("Cart quantities updated successfully")
      }
    } catch (cartError) {
      console.warn("Error updating cart quantities:", cartError)
    }

    // Send confirmation email
    if (orderData.billingDetails?.email) {
      try {
        const orderObj = newOrder.toObject() as Order
        const htmlContent = generateOrderConfirmationEmail(orderObj)

        await sendEmail({
          to: orderData.billingDetails.email,
          subject: `Order Confirmation #${newOrder._id}`,
          html: htmlContent,
        })

        console.log("Order confirmation email sent successfully")
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError)
      }
    }

    if (orderData.billingDetails?.phoneNumber || orderData.billingDetails?.phone) {
      console.log("[WhatsApp] Service disabled - Twilio not configured")
      console.log("[WhatsApp] Order notification skipped")
      /*
      try {
        const customerPhone = orderData.billingDetails.phoneNumber || orderData.billingDetails.phone
        const customerName =
          `${orderData.billingDetails.firstName || ""} ${orderData.billingDetails.lastName || ""}`.trim() || "Customer"

        const whatsappOrderDetails = {
          orderId: newOrder._id.toString(),
          customerName: customerName,
          customerPhone: customerPhone,
          products: enhancedProducts.map((product) => ({
            title: product.title,
            quantity: product.quantity,
            price: product.price,
          })),
          totalAmount: orderData.totalAmount || 0,
          paymentMethod: orderData.paymentMethod || "COD",
          status: orderData.status || "PENDING",
          createdAt: new Date().toISOString(),
        }

        console.log("Sending WhatsApp notification to:", customerPhone)
        const whatsappSent = await whatsappService.sendOrderNotification(whatsappOrderDetails)

        if (whatsappSent) {
          console.log("WhatsApp notification sent successfully")
        } else {
          console.warn("WhatsApp notification failed to send")
        }
      } catch (whatsappError) {
        console.error("Error sending WhatsApp notification:", whatsappError)
        // Don't fail the order creation if WhatsApp fails
      }
      */
    } else {
      console.warn("No phone number provided for WhatsApp notification")
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    )
  }
}
