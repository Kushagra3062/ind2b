import { StatsCard } from "@/components/admin/reviews/stats-card"
import { ReviewsTable } from "@/components/admin/reviews/reviews-table"
import { connectProfileDB } from "@/lib/profileDb"

async function getProductStats() {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()

    // Get the Product model from the connection
    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in connection")
      return {
        total: 0,
        pending: 0,
        approved: 0,
        flagged: 0,
        totalCommission: 0,
        pendingCommission: 0,
        approvedCommission: 0,
        flaggedCommission: 0,
      }
    }

    // Get total count and counts by status in parallel
    const [
      total,
      pending,
      approved,
      flagged,
      totalCommission,
      pendingCommission,
      approvedCommission,
      flaggedCommission,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({
        $or: [{ status: "Pending" }, { status: "pending" }, { status: { $exists: false } }],
      }),
      Product.countDocuments({
        $or: [{ status: "Approved" }, { status: "approved" }],
      }),
      Product.countDocuments({
        $or: [{ status: "Flagged" }, { status: "flagged" }],
      }),
      Product.aggregate([{ $match: {} }, { $group: { _id: null, totalCommission: { $sum: "$commission" } } }]).then(
        (results) => (results.length > 0 ? results[0].totalCommission : 0),
      ),
      Product.aggregate([
        { $match: { $or: [{ status: "Pending" }, { status: "pending" }, { status: { $exists: false } }] } },
        { $group: { _id: null, pendingCommission: { $sum: "$commission" } } },
      ]).then((results) => (results.length > 0 ? results[0].pendingCommission : 0)),
      Product.aggregate([
        { $match: { $or: [{ status: "Approved" }, { status: "approved" }] } },
        { $group: { _id: null, approvedCommission: { $sum: "$commission" } } },
      ]).then((results) => (results.length > 0 ? results[0].approvedCommission : 0)),
      Product.aggregate([
        { $match: { $or: [{ status: "Flagged" }, { status: "flagged" }] } },
        { $group: { _id: null, flaggedCommission: { $sum: "$commission" } } },
      ]).then((results) => (results.length > 0 ? results[0].flaggedCommission : 0)),
    ])

    console.log("Product stats from PROFILE_DB:", {
      total,
      pending,
      approved,
      flagged,
      totalCommission,
      pendingCommission,
      approvedCommission,
      flaggedCommission,
    })

    return {
      total: total || 0,
      pending: pending || 0,
      approved: approved || 0,
      flagged: flagged || 0,
      totalCommission: totalCommission || 0,
      pendingCommission: pendingCommission || 0,
      approvedCommission: approvedCommission || 0,
      flaggedCommission: flaggedCommission || 0,
    }
  } catch (error: unknown) {
    console.error("Error fetching product stats:", error instanceof Error ? error.message : "Unknown error")

    return {
      total: 0,
      pending: 0,
      approved: 0,
      flagged: 0,
      totalCommission: 0,
      pendingCommission: 0,
      approvedCommission: 0,
      flaggedCommission: 0,
    }
  }
}

export default async function ReviewsPage() {
  const stats = await getProductStats()

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground">
            Manage product status, commission settings, and review product details.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard title="Total Products" value={stats.total} type="total" />
          <StatsCard title="Pending Products" value={stats.pending} type="pending" />
          <StatsCard title="Approved Products" value={stats.approved} type="approved" />
          <StatsCard title="Flagged Products" value={stats.flagged} type="flagged" />
          
        </div>
        <ReviewsTable />
      </div>
    </div>
  )
}
