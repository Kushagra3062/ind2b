import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: Request) {
  try {
    console.log("Fetching brands from CategoryBrand model in PROFILE_DB")
    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()

    // Get the CategoryBrand and Product models from the connection
    const CategoryBrandModel = connection.models.CategoryBrand
    const ProductModel = connection.models.Product

    if (!CategoryBrandModel) {
      console.error("CategoryBrand model not found in PROFILE_DB")
      return NextResponse.json({ error: "CategoryBrand model not found" }, { status: 500 })
    }

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10)

    // Fetch all categorybrands documents
    const categoryBrandDocs = await CategoryBrandModel.find({
      authorizedBrands: { $exists: true, $ne: [] },
      categories: { $exists: true, $ne: [] },
    }).select("authorizedBrands categories")

    console.log(`Found ${categoryBrandDocs.length} CategoryBrand documents`)

    // Create a map of brands to their associated categories
    const brandCategoryMap = new Map<string, Set<string>>()

    categoryBrandDocs.forEach((doc) => {
      if (
        doc.authorizedBrands &&
        Array.isArray(doc.authorizedBrands) &&
        doc.categories &&
        Array.isArray(doc.categories)
      ) {
        doc.authorizedBrands.forEach((brand: string) => {
          if (brand && brand.trim()) {
            const brandName = brand.trim()
            if (!brandCategoryMap.has(brandName)) {
              brandCategoryMap.set(brandName, new Set())
            }

            // Add all categories for this brand
            doc.categories.forEach((category: string) => {
              if (category && category.trim()) {
                brandCategoryMap.get(brandName)!.add(category.trim())
              }
            })
          }
        })
      }
    })

    console.log(`Found ${brandCategoryMap.size} unique authorized brands with categories`)

    if (brandCategoryMap.size === 0) {
      console.log("No authorized brands with categories found")
      return NextResponse.json([], { status: 200 })
    }

    // Now get product counts for each brand based on their categories
    const brandPromises = Array.from(brandCategoryMap.entries()).map(async ([brandName, categories]) => {
      try {
        const categoryArray = Array.from(categories)

        // Count products in the categories associated with this brand
        const productCount = await ProductModel.countDocuments({
          isActive: true,
          is_draft: false,
          category_name: { $in: categoryArray },
        })

        if (productCount === 0) {
          return null // Skip brands with no products in their categories
        }

        // Get sample product data from the brand's categories
        const sampleProduct = await ProductModel.findOne({
          isActive: true,
          is_draft: false,
          category_name: { $in: categoryArray },
        }).select("image_link price category_name")

        // Get aggregated data for products in this brand's categories
        const aggregatedData = await ProductModel.aggregate([
          {
            $match: {
              isActive: true,
              is_draft: false,
              category_name: { $in: categoryArray },
            },
          },
          {
            $group: {
              _id: null,
              avgPrice: { $avg: "$price" },
              totalStock: { $sum: "$stock" },
              avgRating: { $avg: "$rating" },
            },
          },
        ])

        const stats = aggregatedData[0] || {
          avgPrice: sampleProduct?.price || 0,
          totalStock: 0,
          avgRating: 0,
        }

        return {
          name: brandName,
          productCount,
          avgPrice: Math.round(stats.avgPrice * 100) / 100,
          totalStock: stats.totalStock,
          avgRating: Math.round(stats.avgRating * 10) / 10,
          sampleImage: sampleProduct?.image_link || null,
          categories: categoryArray,
          href: `/brands/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
        }
      } catch (error) {
        console.error(`Error processing brand ${brandName}:`, error)
        return null
      }
    })

    // Wait for all brand processing to complete
    const brandResults = await Promise.all(brandPromises)

    // Filter out null results and sort by product count
    const validBrands = brandResults
      .filter((brand) => brand !== null)
      .sort((a, b) => b!.productCount - a!.productCount)
      .slice(0, limit)

    console.log(`Returning ${validBrands.length} brands with products in their categories`)

    // Add cache headers for better performance
    const response = NextResponse.json(validBrands, { status: 200 })

    // Cache for 10 minutes for better performance
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200")

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching brands from CategoryBrand model:", errorMessage)
    return NextResponse.json({ error: "Error fetching brands" }, { status: 500 })
  }
}
