import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const { category } = await params
    const decodedCategory = decodeURIComponent(category)

    if (!decodedCategory || decodedCategory === "undefined" || decodedCategory.trim() === "") {
      console.error(`Invalid category name: ${decodedCategory}`)
      return NextResponse.json(
        { error: "Invalid category name", products: [], totalCount: 0, subcategories: [] },
        { status: 400 },
      )
    }

    console.log(`Fetching products for category: ${decodedCategory}`)

    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1
    const subcategory = searchParams.get("subcategory")

    // Build filter
    const filter: any = {
      isActive: true,
      is_draft: false,
      category_name: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
    }

    if (subcategory && subcategory !== "all") {
      filter.sub_category_name = { $regex: new RegExp(`^${subcategory}$`, "i") }
    }

    // Get total count for pagination
    const totalCount = await ProductModel.countDocuments(filter)

    // Query products with pagination and sorting
    const products = await ProductModel.find(filter)
      .lean()
      .select({
        product_id: 1,
        title: 1,
        description: 1,
        image_link: 1,
        stock: 1,
        price: 1,
        discount: 1,
        SKU: 1,
        seller_id: 1,
        rating: 1,
        seller_name: 1,
        location: 1,
        category_name: 1,
        sub_category_name: 1,
        created_at: 1,
      })
      .sort({ [sortBy]: sortOrder })
      .skip(offset)
      .limit(limit)

    console.log(`Found ${products.length} products for category: ${decodedCategory}`)

    // Get subcategories for this category
    const subcategories = await ProductModel.distinct("sub_category_name", {
      ...filter,
      sub_category_name: { $exists: true, $ne: null},
    })

    const response = NextResponse.json({
      products,
      totalCount,
      subcategories: subcategories.filter(Boolean),
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1,
        hasNext: offset + limit < totalCount,
        hasPrev: offset > 0,
      },
    })

    // Cache for 5 minutes
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`Error fetching products for category:`, errorMessage)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}
