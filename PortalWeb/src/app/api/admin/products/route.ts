import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching products from PROFILE_DB...")
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const date = searchParams.get("date")
    const commission = searchParams.get("commission")

    // Connect to the profile database
    const connection = await connectProfileDB()
    console.log("Connected to PROFILE_DB")

    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in profileDb connection")
      return NextResponse.json({ error: "Product model not available" }, { status: 500 })
    }

    // Build query filters
    const query: any = {}

    if (status && status !== "all") {
      if (status.toLowerCase() === "pending") {
        query.$or = [{ status: { $regex: new RegExp(`^${status}$`, "i") } }, { status: { $exists: false } }]
      } else {
        query.status = { $regex: new RegExp(`^${status}$`, "i") }
      }
    }

    if (commission && commission !== "all") {
      query.commission = commission
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.created_at = {
        $gte: startDate,
        $lt: endDate,
      }
    }

    console.log("Query filters:", query)

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch products with pagination
    const products = await Product.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean()

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    // Transform products to include seller_name and ensure all required fields with proper number conversion
    const transformedProducts = products.map((product: any) => {
      const originalPrice = Number(product.price) || 0
      const commissionValue = Number(product.commission_value) || 0
      const finalPrice = Number(product.final_price) || originalPrice

      return {
        _id: product._id,
        product_id: product.product_id,
        title: product.title || "Untitled Product",
        image_link: product.image_link || null,
        seller_name: product.emailId || "Unknown Seller",
        emailId: product.emailId || "Unknown Seller",
        status: product.status || "Pending",
        commission: product.commission || "No",
        price: originalPrice,
        commission_type: product.commission_type || "percentage",
        commission_value: commissionValue,
        final_price: finalPrice,
        created_at: product.created_at || new Date(),
        updated_at: product.updated_at || new Date(),
      }
    })

    console.log(`Fetched ${transformedProducts.length} products from PROFILE_DB (page ${page}, limit ${limit})`)

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching products from PROFILE_DB:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new product in PROFILE_DB...")
    const productData = await request.json()

    // Connect to the profile database
    const connection = await connectProfileDB()
    console.log("Connected to PROFILE_DB")

    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in profileDb connection")
      return NextResponse.json({ error: "Product model not available" }, { status: 500 })
    }

    // Ensure required fields and set defaults with proper number conversion
    const originalPrice = Number(productData.price) || 0
    const commissionValue = Number(productData.commission_value) || 0

    const newProduct = {
      ...productData,
      status: productData.status || "Pending",
      commission: productData.commission || "No",
      price: originalPrice,
      commission_type: productData.commission_type || "percentage",
      commission_value: commissionValue,
      final_price: Number(productData.final_price) || originalPrice,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const product = new Product(newProduct)
    const savedProduct = await product.save()

    console.log(`New product created in PROFILE_DB with ID: ${savedProduct.product_id}`)

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    })
  } catch (error) {
    console.error("Error creating product in PROFILE_DB:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
