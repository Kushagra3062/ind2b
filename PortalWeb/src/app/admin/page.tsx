"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/admin/stat-card"
import { PendingCard } from "@/components/admin/pending-card"
import { SalesChart } from "@/components/admin/sales-chart"
import { RecentSellersTable } from "@/components/admin/recent-sellers-table"
import { RecentIssuesTable } from "@/components/admin/recent-issues-table"
import { RecentProductsTable } from "@/components/admin/recent-products-table"
import { Users, Package, DollarSign, ShoppingCart, PackageCheck, RefreshCw } from "lucide-react"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DashboardData {
  totalSellers: number
  activeSellers: number
  totalOrders: number
  completedOrders: number
  totalProductsListed: number
  totalRevenue: number
  productsPendingApproval: number
  monthlyRevenue: number
  sellersGrowth: number
  ordersGrowth: number
  productsGrowth: number
  revenueGrowth: number
  recentOrders: Array<{
    id: string
    totalAmount: number
    status: string
    createdAt: string
    productsCount: number
  }>
  lastUpdated: string
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data
      })

      const result = await response.json()

      if (result.success) {
        // Ensure all numeric values are properly converted
        const processedData = {
          ...result.data,
          totalSellers: Number(result.data.totalSellers) || 0,
          activeSellers: Number(result.data.activeSellers) || 0,
          totalOrders: Number(result.data.totalOrders) || 0,
          completedOrders: Number(result.data.completedOrders) || 0,
          totalProductsListed: Number(result.data.totalProductsListed) || 0,
          totalRevenue: Number(result.data.totalRevenue) || 0,
          productsPendingApproval: Number(result.data.productsPendingApproval) || 0,
          monthlyRevenue: Number(result.data.monthlyRevenue) || 0,
          sellersGrowth: Number(result.data.sellersGrowth) || 0,
          ordersGrowth: Number(result.data.ordersGrowth) || 0,
          productsGrowth: Number(result.data.productsGrowth) || 0,
          revenueGrowth: Number(result.data.revenueGrowth) || 0,
        }

        setDashboardData(processedData)
        if (showRefreshToast) {
          toast.success("Dashboard data refreshed successfully!")
        }
      } else {
        console.error("Failed to fetch dashboard data:", result.error)
        toast.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Error fetching dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchDashboardData()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  // Helper function to format growth percentage
  const formatGrowth = (growth: number): string => {
    if (growth > 0) return `+${growth.toFixed(1)}%`
    if (growth < 0) return `${growth.toFixed(1)}%`
    return "0%"
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Failed to load dashboard data</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Sellers"
          value={formatNumber(dashboardData.totalSellers)}
          change={{
            type: dashboardData.sellersGrowth >= 0 ? "increase" : "decrease",
            value: `${dashboardData.activeSellers} Active`,
            period: `${formatGrowth(dashboardData.sellersGrowth)} growth`,
          }}
          icon={<Users className="w-6 h-6 text-primary" />}
        />
        <StatCard
          title="Total Products Listed"
          value={formatNumber(dashboardData.totalProductsListed)}
          change={{
            type: dashboardData.productsGrowth >= 0 ? "increase" : "decrease",
            value: formatGrowth(dashboardData.productsGrowth),
            period: "Up from past week",
          }}
          icon={<Package className="w-6 h-6 text-primary" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.totalRevenue)}
          change={{
            type: dashboardData.revenueGrowth >= 0 ? "increase" : "decrease",
            value: formatGrowth(dashboardData.revenueGrowth),
            period: "Overall growth",
          }}
          icon={<DollarSign className="w-6 h-6 text-primary" />}
        />
      </div>

      {/* Pending Items Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <PendingCard
          title="Total Orders"
          value={dashboardData.totalOrders}
          change={{
            value: `${dashboardData.completedOrders} Completed`,
            period: `${formatGrowth(dashboardData.ordersGrowth)} completion rate`,
          }}
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <PendingCard
          title="Products Pending Approval"
          value={dashboardData.productsPendingApproval}
          change={{
            value: "Needs Review",
            period: "Awaiting admin action",
          }}
          icon={<PackageCheck className="w-6 h-6" />}
        />
        <PendingCard
          title="Monthly Revenue"
          value={dashboardData.monthlyRevenue}
          change={{
            value: "This Month",
            period: "Current period",
          }}
          icon={<DollarSign className="w-6 h-6" />}
        />
      </div>

      <div className="w-full overflow-hidden">
        <SalesChart />
      </div>

      <div >
        <RecentSellersTable />
        
      </div>

      <div>
        <RecentProductsTable />
      </div>
    </div>
  )
}
