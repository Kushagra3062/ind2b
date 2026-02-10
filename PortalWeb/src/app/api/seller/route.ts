import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// GET handler to fetch products
export async function GET(req: NextRequest) {
  try {
    // Connect to PROFILE_DB
    const connection = await connectProfileDB()

    // Get the Product model from this connection
    const Product = connection.models.Product

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const subCategory = searchParams.get("subCategory")
    const search = searchParams.get("search")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

    // Build query
    const query: any = {}

    if (category) {
      query.category_id = Number.parseInt(category)
    }

    if (subCategory) {
      query.sub_category_id = Number.parseInt(subCategory)
    }

    if (search) {
      query.title = { $regex: search, $options: "i" }
    }

    // Get products
    const products = await Product.find(query).limit(limit).sort({ created_at: -1 })

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products", message: error.message }, { status: 500 })
  }
}
