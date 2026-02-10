"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Clock, Package, Truck, RotateCcw } from "lucide-react"
import { getOrderStats } from "@/actions/admin-orders"

// Map string icon names to actual components
const iconMap = {
  ShoppingCart,
  Clock,
  Package,
  Truck,
  RotateCcw,
}

export default function StatsSection() {
  const [stats, setStats] = useState([
    { title: "Total Orders", value: "...", change: "...", icon: "ShoppingCart", color: "bg-orange-500" },
    { title: "Pending Order", value: "...", change: "...", icon: "Clock", color: "bg-red-500" },
    { title: "Orders Shipped", value: "...", change: "...", icon: "Package", color: "bg-blue-500" },
    { title: "Order Delivered", value: "...", change: "...", icon: "Truck", color: "bg-green-500" },
    { title: "Return Requests", value: "...", change: "...", icon: "RotateCcw", color: "bg-orange-500" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOrderStats()
        if (data && data.length > 0) {
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon as keyof typeof iconMap]

        return (
          <Card key={index} className={loading ? "animate-pulse" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 ${stat.color} rounded-lg`}>{Icon && <Icon className="h-6 w-6 text-white" />}</div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
