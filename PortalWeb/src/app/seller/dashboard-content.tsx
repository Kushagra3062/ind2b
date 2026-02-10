"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PerformanceCard } from "@/components/seller/performance-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Order {
  _id: string
  orderId: string
  orderNumber: string
  createdAt: string
  status: string
  customer: string
  customerCompany: string
  amount: number
  products: any[]
}

interface DailySales {
  date: string
  day: string
  sales: number
}

interface DashboardData {
  sellerName: string
  metrics: {
    totalProducts: number
    pendingProducts: number
    inventoryValue: number
    monthlySales: number
    pendingOrders: number
  }
  recentOrders: Order[]
  dailySales: DailySales[]
}

export default function DashboardContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/seller/dashboard")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch dashboard data")
      }

      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(
      () => {
        fetchDashboardData()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "completed" || statusLower === "delivered") return "bg-green-100 text-green-800"
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-800"
    if (statusLower === "processing") return "bg-blue-100 text-blue-800"
    if (statusLower === "cancelled") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Loading dashboard data...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {data?.sellerName}</h1>
          <p className="text-gray-600">Here's your Seller Performance summary for this Month</p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PerformanceCard
          icon={<Package className="h-6 w-6 text-blue-600" />}
          label="Products Listed"
          value={data?.metrics.totalProducts.toString() || "0"}
        />
        <PerformanceCard
          icon={<ShoppingCart className="h-6 w-6 text-orange-600" />}
          label="Orders Pending"
          value={data?.metrics.pendingOrders.toString() || "0"}
        />
        <PerformanceCard
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          label="Inventory Value"
          value={`₹${(data?.metrics.inventoryValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          prefix=""
        />
        <PerformanceCard
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          label="Monthly Sales"
          value={formatCurrency(data?.metrics.monthlySales || 0)}
          prefix=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push("/seller/orders")}>
                    View All
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ORDER #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">PRODUCT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">CUSTOMER</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">STATUS</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">AMOUNT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">VIEW</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.recentOrders && data.recentOrders.length > 0 ? (
                      data.recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm">{order.orderNumber}</td>
                          <td className="px-4 py-4 text-sm">
                            {order.products[0]?.title || "Product"}
                            {order.products.length > 1 && ` +${order.products.length - 1} more`}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {order.customer}
                            {order.customerCompany && (
                              <div className="text-xs text-gray-500">{order.customerCompany}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium">{formatCurrency(order.amount)}</td>
                          <td className="px-4 py-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/seller/orders/${order.orderId}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sales Trend</h2>
                <div className="text-sm font-medium">This Week</div>
              </div>

              <div className="p-4 h-[350px]">
                {data?.dailySales && data.dailySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailySales} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Sales"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No sales data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
