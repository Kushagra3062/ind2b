import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET() {
  try {
    console.log("Fetching unique categories from PROFILE_DB")

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Get all unique categories from active, non-draft products
    const categories = await ProductModel.distinct("category_name", {
      isActive: true,
      is_draft: false,
      category_name: { $exists: true, $ne: null,  },
    })

    // Filter out null/empty categories and sort
    const validCategories = categories
      .filter((category) => category && category.trim() !== "")
      .map((category) => category.trim())
      .sort()

    console.log(`Found ${validCategories.length} unique categories:`, validCategories)

    // Cache for 10 minutes
    const response = NextResponse.json(validCategories, { status: 200 })
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200")

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching categories from PROFILE_DB:", errorMessage)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}
