import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: Request) {
  try {
    console.log("=== PRODUCTS API CALLED ===")

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product
    const ReviewModel = connection.models.Review

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    if (!ReviewModel) {
      console.error("Review model not found in PROFILE_DB")
      return NextResponse.json({ error: "Review model not found" }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "0", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    console.log(`Search params:`)
    console.log(`  - Query: "${query}"`)
    console.log(`  - Category: "${category}"`)
    console.log(`  - Limit: ${limit}`)
    console.log(`  - Offset: ${offset}`)

    // Build base filter for active, non-draft products
    const filter: any = {
      isActive: true,
      is_draft: false,
    }

    // Handle search query
    if (query.trim()) {
      console.log(`Processing search query: "${query}"`)

      // First check if the query exactly matches a category name
      const allCategories = await ProductModel.distinct("category_name", {
        isActive: true,
        is_draft: false,
        category_name: { $exists: true, $ne: null },
      })

      const isQueryACategory = allCategories.some((cat) => cat && cat.toLowerCase() === query.trim().toLowerCase())

      if (isQueryACategory) {
        // If query is a category name, show all products from that category
        console.log(`Query "${query}" matches a category, showing all products from this category`)
        filter.category_name = new RegExp(`^${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      } else {
        // Otherwise, perform text search across multiple fields
        console.log(`Performing text search for: "${query}"`)
        const searchRegex = { $regex: query.trim(), $options: "i" }
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
          { category_name: searchRegex },
          { sub_category_name: searchRegex },
        ]
      }
    }

    // Handle category filter (this overrides the query-based category detection)
    if (category.trim() && category !== "All Categories") {
      console.log(`Filtering by specific category: "${category}"`)
      filter.category_name = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      // Remove the $or condition if we're filtering by specific category
      if (filter.$or) {
        delete filter.$or
        console.log("Removed text search filter due to category filter")
      }
    }

    console.log("Final MongoDB filter:", JSON.stringify(filter, null, 2))

    // First, get the products
    let productsQuery = ProductModel.find(filter).lean().select({
      product_id: 1,
      title: 1,
      description: 1,
      image_link: 1,
      stock: 1,
      price: 1,
      discount: 1,
      SKU: 1,
      seller_id: 1,
      seller_name: 1,
      location: 1,
      category_name: 1,
      sub_category_name: 1,
      brand: 1,
      original_price: 1,
      units: 1,
      delivery_option: 1,
      created_at: 1,
      final_price: 1, // Added final_price field to API query
    })

    // Apply pagination if specified
    if (offset > 0) {
      productsQuery = productsQuery.skip(offset)
      console.log(`Applied offset: ${offset}`)
    }
    if (limit > 0) {
      productsQuery = productsQuery.limit(limit)
      console.log(`Applied limit: ${limit}`)
    }

    // Execute query
    const startTime = Date.now()
    const products = await productsQuery
    const queryTime = Date.now() - startTime

    console.log(`=== QUERY RESULTS ===`)
    console.log(`Found ${products.length} products (query time: ${queryTime}ms)`)

    // Function to extract numerical product ID
    const extractProductId = (productId: string | number): string => {
      if (!productId) return ""

      const productIdStr = productId.toString()

      // If it contains "/product/" or "/products/", extract the number after it
      if (productIdStr.includes("/product/")) {
        const parts = productIdStr.split("/product/")
        return parts[parts.length - 1] || ""
      }

      if (productIdStr.includes("/products/")) {
        const parts = productIdStr.split("/products/")
        return parts[parts.length - 1] || ""
      }

      // If it starts with "/" and contains numbers, extract the number
      if (productIdStr.startsWith("/") && /\d+/.test(productIdStr)) {
        const match = productIdStr.match(/\d+/)
        return match ? match[0] : ""
      }

      // If it's already a number or clean string, return as is
      return productIdStr
    }

    // Extract clean product IDs for rating lookup
    const productIdMappings = new Map()
    const cleanProductIds: string[] = []

    products.forEach((product) => {
      const originalId = product.product_id
      const cleanId = extractProductId(originalId)
      if (cleanId) {
        productIdMappings.set(cleanId, originalId)
        cleanProductIds.push(cleanId)
      }
    })

    console.log(`Extracted clean product IDs: ${cleanProductIds.slice(0, 5).join(", ")}...`)

    // Get all possible variations of product IDs that might exist in reviews
    const allPossibleIds: string[] = []
    cleanProductIds.forEach((id) => {
      allPossibleIds.push(id) // Just the number
      allPossibleIds.push(`/product/${id}`) // With /product/ prefix
      allPossibleIds.push(`/products/${id}`) // With /products/ prefix
    })

    console.log(`Searching reviews with all possible ID formats...`)

    // Get ratings aggregation for all products
    const ratingsAggregation = await ReviewModel.aggregate([
      {
        $match: {
          product_id: { $in: allPossibleIds },
          status: "approved",
        },
      },
      {
        $addFields: {
          cleanProductId: {
            $cond: {
              if: { $regexMatch: { input: { $toString: "$product_id" }, regex: "^/products?/" } },
              then: {
                $arrayElemAt: [{ $split: [{ $toString: "$product_id" }, "/"] }, -1],
              },
              else: { $toString: "$product_id" },
            },
          },
        },
      },
      {
        $group: {
          _id: "$cleanProductId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ])

    console.log(`Found ratings for ${ratingsAggregation.length} products`)

    // Create a map for quick lookup using clean product IDs
    const ratingsMap = new Map()
    ratingsAggregation.forEach((rating) => {
      const cleanId = rating._id
      ratingsMap.set(cleanId, {
        averageRating: Math.round(rating.averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: rating.reviewCount,
      })
    })

    // Log sample results for debugging
    if (products.length > 0) {
      console.log("Sample products with ratings:")
      products.slice(0, 5).forEach((p, i) => {
        const cleanProductId = extractProductId(p.product_id)
        const ratingData = ratingsMap.get(cleanProductId)
        console.log(
          `  ${i + 1}. "${p.title}" (Original ID: ${p.product_id}, Clean ID: ${cleanProductId}, Rating: ${ratingData?.averageRating || 0}, Reviews: ${ratingData?.reviewCount || 0})`,
        )
      })
    } else {
      console.log("❌ NO PRODUCTS FOUND!")

      // Debug: Check if there are any products in the specified category
      if (category && category !== "All Categories") {
        const categoryCount = await ProductModel.countDocuments({
          isActive: true,
          is_draft: false,
          category_name: new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        })
        console.log(`Debug: Total products in category "${category}": ${categoryCount}`)

        // Check exact category names in database
        const exactCategories = await ProductModel.distinct("category_name", {
          isActive: true,
          is_draft: false,
        })
        console.log("All available categories in DB:", exactCategories)
      }

      // Debug: Check total active products
      const totalActiveProducts = await ProductModel.countDocuments({
        isActive: true,
        is_draft: false,
      })
      console.log(`Debug: Total active products in DB: ${totalActiveProducts}`)
    }

    // Transform products to ensure consistent format and include ratings
    const transformedProducts = products.map((product) => {
      const cleanProductId = extractProductId(product.product_id)
      const ratingData = ratingsMap.get(cleanProductId)

      return {
        product_id: product.product_id || product._id?.toString(),
        title: product.title || "",
        description: product.description || "",
        image_link: product.image_link || "/placeholder.svg?height=200&width=200",
        stock: product.stock || 0,
        price: product.price || 0,
        discount: product.discount || 0,
        SKU: product.SKU || "",
        seller_id: product.seller_id || 0,
        rating: ratingData?.averageRating || 0,
        reviewCount: ratingData?.reviewCount || 0,
        seller_name: product.seller_name || "",
        location: product.location || "Delhi",
        category_name: product.category_name || "",
        sub_category_name: product.sub_category_name || "",
        brand: product.brand || "",
        original_price: product.original_price || product.price || 0,
        units: product.units || "",
        delivery_option: product.delivery_option || "Free Delivery Available",
        created_at: product.created_at,
        final_price: product.final_price || 0, // Added final_price to transformed response
      }
    })

    console.log(`=== RETURNING ${transformedProducts.length} TRANSFORMED PRODUCTS WITH RATINGS ===`)

    const response = NextResponse.json(transformedProducts, { status: 200 })
    response.headers.set("Cache-Control", "public, s-maxage=1200, stale-while-revalidate=2400")

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ ERROR in products API:", errorMessage)
    console.error("Stack trace:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product

    const productData = await request.json()
    const newProduct = new ProductModel(productData)
    await newProduct.save()
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error posting product:", errorMessage)
    return NextResponse.json({ error: "Error posting product" }, { status: 500 })
  }
}
