import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query.trim() || query.length < 2) {
      return NextResponse.json([], { status: 200 })
    }

    console.log(`Fetching suggestions for query: "${query}"`)

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    const searchRegex = { $regex: query.trim(), $options: "i" }

    // Get category suggestions
    const categoryMatches = await ProductModel.distinct("category_name", {
      isActive: true,
      is_draft: false,
      category_name: searchRegex,
    })

    // Get product title suggestions
    const productMatches = await ProductModel.find({
      isActive: true,
      is_draft: false,
      title: searchRegex,
    })
      .select("title category_name")
      .limit(3)
      .lean()

    const suggestions: { text: any; type: string; description: string }[] = []

    // Add category suggestions
    categoryMatches.slice(0, 2).forEach((category) => {
      if (category && category.trim()) {
        suggestions.push({
          text: category.trim(),
          type: "category",
          description: `Browse all products in ${category}`,
        })
      }
    })

    // Add product suggestions
    productMatches.forEach((product) => {
      if (product.title && product.title.trim()) {
        suggestions.push({
          text: product.title.trim(),
          type: "product",
          description: `Product in ${product.category_name || "Unknown"} category`,
        })
      }
    })

    console.log(`Found ${suggestions.length} suggestions for "${query}"`)

    return NextResponse.json(suggestions.slice(0, 5), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching suggestions:", errorMessage)
    return NextResponse.json({ error: "Error fetching suggestions" }, { status: 500 })
  }
}
