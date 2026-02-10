import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { getCurrentUser } from "@/actions/auth"

// Update the product schema definition to ensure emailId is included
const productSchema = new mongoose.Schema({
  product_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  model: String,
  description: String,
  category_id: Number,
  sub_category_id: Number,
  units: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  image_link: String,
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: Number,
  SKU: { type: String, required: true },
  seller_id: String, // Changed to String to match userId from profileDB
  emailId: { type: String, required: true }, // Ensure emailId is required
  created_at: { type: Date, default: Date.now },
  rating: Number,
  updated_at: { type: Date, default: Date.now },
  seller_name: { type: String, required: true },
  location: { type: String, required: true },
  category_name: { type: String, required: true },
  sub_category_name: String,
  is_draft: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
})

// Create or get the model
let Product: mongoose.Model<any>

// Helper function to get seller email from contacts
async function getSellerEmail(connection: mongoose.Connection) {
  try {
    // Get session to identify the current user
    const user = await getCurrentUser()

    if (!user?.id) {
      console.log("No user ID found in session")
      return null
    }

    // Define Contact schema if it doesn't exist
    if (!connection.models.Contact) {
      const ContactSchema = new mongoose.Schema(
        {
          userId: { type: String, required: true, index: true },
          contactName: { type: String, required: true },
          phoneNumber: { type: String, required: true },
          emailId: { type: String, required: true },
          pickupTime: { type: String, required: true },
        },
        { timestamps: true },
      )

      connection.model("Contact", ContactSchema)
    }

    // Get Contact model
    const Contact = connection.models.Contact

    // Find contact details for the current user
    const contactDetails = await Contact.findOne({ userId: user.id })

    if (!contactDetails) {
      console.log("No contact details found for user:", user.id)
      return null
    }

    return {
      emailId: contactDetails.emailId,
      userId: user.id,
    }
  } catch (error) {
    console.error("Error fetching seller email:", error)
    return null
  }
}

// GET handler to fetch products
export async function GET(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Register the Product model with this connection if it doesn't exist
    if (!connection.models.Product) {
      connection.model("Product", productSchema)
    }

    // Get the Product model from this connection
    Product = connection.models.Product

    // Get seller details from contacts
    const sellerDetails = await getSellerEmail(connection)

    if (!sellerDetails) {
      return NextResponse.json(
        {
          error: "Seller details not found. Please complete your profile first.",
        },
        { status: 400 },
      )
    }

    console.log("Fetching products for seller:", sellerDetails)

    // Get products filtered by both seller_id and emailId for maximum accuracy
    const products = await Product.find({
      $or: [
        { seller_id: sellerDetails.userId },
        { emailId: sellerDetails.emailId },
        {
          $and: [{ seller_id: sellerDetails.userId }, { emailId: sellerDetails.emailId }],
        },
      ],
    }).sort({ created_at: -1 })

    console.log(`Fetched ${products.length} products for seller:`, {
      userId: sellerDetails.userId,
      emailId: sellerDetails.emailId,
    })

    // Log first few products for debugging
    if (products.length > 0) {
      console.log(
        "Sample products:",
        products.slice(0, 2).map((p) => ({
          product_id: p.product_id,
          title: p.title,
          seller_id: p.seller_id,
          emailId: p.emailId,
        })),
      )
    }

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products", message: error.message }, { status: 500 })
  }
}

// POST handler to create a new product
export async function POST(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Register the Product model with this connection if it doesn't exist
    if (!connection.models.Product) {
      connection.model("Product", productSchema)
    }

    // Get the Product model from this connection
    Product = connection.models.Product

    const data = await req.json()
    console.log("Received product data:", data)

    // Get current user to associate with the product
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      )
    }

    // Get seller details
    const sellerDetails = await getSellerEmail(connection)
    if (!sellerDetails) {
      return NextResponse.json(
        {
          error: "Seller email not found. Please complete your profile first.",
        },
        { status: 400 },
      )
    }

    // Validate emailId
    if (!data.emailId) {
      data.emailId = sellerDetails.emailId
    }

    // Add seller_id to the product data
    data.seller_id = user.id

    // Generate a new product_id
    const highestProduct = await Product.findOne().sort({ product_id: -1 })
    const nextProductId = highestProduct ? highestProduct.product_id + 1 : 1

    // Create a new product with explicit emailId and seller_id
    const productData = {
      ...data,
      product_id: nextProductId,
      seller_id: user.id,
      emailId: sellerDetails.emailId,
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.log("Final product data to save:", productData)

    const product = new Product(productData)

    await product.save()
    console.log("Saved product to PROFILE_DB:", product)

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product", message: error.message }, { status: 500 })
  }
}

// PUT handler to update a product
export async function PUT(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Register the Product model with this connection if it doesn't exist
    if (!connection.models.Product) {
      connection.model("Product", productSchema)
    }

    // Get the Product model from this connection
    Product = connection.models.Product

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const data = await req.json()

    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      )
    }

    // Get seller details
    const sellerDetails = await getSellerEmail(connection)
    if (!sellerDetails) {
      return NextResponse.json(
        {
          error: "Seller details not found",
        },
        { status: 400 },
      )
    }

    // Find the product first to check ownership
    const existingProduct = await Product.findOne({ product_id: Number.parseInt(id) })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check ownership using both seller_id and emailId
    const isOwner = existingProduct.seller_id === user.id || existingProduct.emailId === sellerDetails.emailId

    if (!isOwner) {
      return NextResponse.json(
        {
          error: "You don't have permission to update this product",
        },
        { status: 403 },
      )
    }

    // Update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id: Number.parseInt(id) },
      {
        ...data,
        updated_at: new Date(),
      },
      { new: true },
    )

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product", message: error.message }, { status: 500 })
  }
}

// PATCH handler to update product status
export async function PATCH(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Register the Product model with this connection if it doesn't exist
    if (!connection.models.Product) {
      connection.model("Product", productSchema)
    }

    // Get the Product model from this connection
    Product = connection.models.Product

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const data = await req.json()

    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      )
    }

    // Get seller details
    const sellerDetails = await getSellerEmail(connection)
    if (!sellerDetails) {
      return NextResponse.json(
        {
          error: "Seller details not found",
        },
        { status: 400 },
      )
    }

    // Find the product first to check ownership
    const existingProduct = await Product.findOne({ product_id: Number.parseInt(id) })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check ownership using both seller_id and emailId
    const isOwner = existingProduct.seller_id === user.id || existingProduct.emailId === sellerDetails.emailId

    if (!isOwner) {
      return NextResponse.json(
        {
          error: "You don't have permission to update this product",
        },
        { status: 403 },
      )
    }

    // Update the product status
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id: Number.parseInt(id) },
      {
        ...data,
        updated_at: new Date(),
      },
      { new: true },
    )

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error("Error updating product status:", error)
    return NextResponse.json({ error: "Failed to update product status", message: error.message }, { status: 500 })
  }
}

// DELETE handler to delete a product
export async function DELETE(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Register the Product model with this connection if it doesn't exist
    if (!connection.models.Product) {
      connection.model("Product", productSchema)
    }

    // Get the Product model from this connection
    Product = connection.models.Product

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Get current user
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      )
    }

    // Get seller details
    const sellerDetails = await getSellerEmail(connection)
    if (!sellerDetails) {
      return NextResponse.json(
        {
          error: "Seller details not found",
        },
        { status: 400 },
      )
    }

    // Find the product first to check ownership
    const existingProduct = await Product.findOne({ product_id: Number.parseInt(id) })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check ownership using both seller_id and emailId
    const isOwner = existingProduct.seller_id === user.id || existingProduct.emailId === sellerDetails.emailId

    if (!isOwner) {
      return NextResponse.json(
        {
          error: "You don't have permission to delete this product",
        },
        { status: 403 },
      )
    }

    // Delete the product
    const deletedProduct = await Product.findOneAndDelete({ product_id: Number.parseInt(id) })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product", message: error.message }, { status: 500 })
  }
}
