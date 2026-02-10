import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "5")
    const skip = (page - 1) * limit

    console.log(`Fetching recent sellers data - Page: ${page}, Limit: ${limit}, Skip: ${skip}`)

    // Connect to database
    const connection = await connectProfileDB()
    console.log("Database connected successfully")

    try {
      // Check if database connection exists
      if (!connection.db) {
        throw new Error("Database connection not available")
      }

      // Get collection reference
      const db = connection.db
      const businessesCollection = db.collection("businesses")

      // Get total count for pagination
      const totalCount = await businessesCollection.countDocuments({})

      // Fetch paginated sellers from businesses collection
      const recentSellers = await businessesCollection
        .find({})
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .skip(skip)
        .limit(limit)
        .toArray()

      console.log(`Recent sellers fetched: ${recentSellers?.length || 0} of ${totalCount} total`)

      // Format the data for the table
      const formattedSellers = (recentSellers || []).map((seller: any) => ({
        id: seller._id?.toString() || "N/A",
        sellerId: seller.userId || seller._id?.toString() || "N/A",
        sellerName: seller.legalEntityName || seller.tradeName || "Unknown Seller",
        gstin: seller.gstin || "N/A",
        registeredDate: seller.createdAt || new Date(),
        businessEntityType: seller.businessEntityType || "N/A",
        state: seller.state || "N/A",
        city: seller.city || "N/A",
      }))

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      console.log("Formatted sellers data:", formattedSellers.length)

      return NextResponse.json({
        success: true,
        data: formattedSellers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      })
    } catch (error) {
      console.error("Error accessing businesses collection:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to access businesses collection",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching recent sellers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recent sellers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
