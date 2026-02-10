"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area } from "recharts"
import { formatCurrency } from "@/lib/utils"

// Define the structure for our chart data points
interface SalesDataPoint {
  day: string
  revenue: number
  percentage: number
  label: string
}

// Define sales data structure
interface SalesData {
  month: string
  totalRevenue: number
  chartData: SalesDataPoint[]
  ordersCount: number
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-medium text-gray-700">Day {label}</p>
        <p className="font-medium text-orange-500">Revenue: {formatCurrency(data.revenue)}</p>
        <p className="text-gray-600">Percentage: {data.percentage.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export function SalesChart() {
  const [selectedMonth, setSelectedMonth] = useState("current")
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSalesData = async (month: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/sales-data?month=${month}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (result.success) {
        setSalesData(result.data)
      } else {
        setError(result.error || "Failed to fetch sales data")
        console.error("Failed to fetch sales data:", result.error)
      }
    } catch (error) {
      setError("Error fetching sales data")
      console.error("Error fetching sales data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchSalesData(selectedMonth)
  }, [selectedMonth])

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
  }

  // Get current month name for display
  const getCurrentMonthName = () => {
    return new Date().toLocaleString("default", { month: "long" })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Sales Details</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[400px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !salesData) {
    return (
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Sales Details</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[400px] w-full flex items-center justify-center">
            <p className="text-gray-500">{error || "No sales data available"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Sales Details</h3>
          <p className="text-sm text-gray-600">
            Total Revenue: {formatCurrency(salesData.totalRevenue)} | Orders: {salesData.ordersCount}
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">{getCurrentMonthName()}</SelectItem>
            <SelectItem value="january">January</SelectItem>
            <SelectItem value="february">February</SelectItem>
            <SelectItem value="march">March</SelectItem>
            <SelectItem value="april">April</SelectItem>
            <SelectItem value="may">May</SelectItem>
            <SelectItem value="june">June</SelectItem>
            <SelectItem value="july">July</SelectItem>
            <SelectItem value="august">August</SelectItem>
            <SelectItem value="september">September</SelectItem>
            <SelectItem value="october">October</SelectItem>
            <SelectItem value="november">November</SelectItem>
            <SelectItem value="december">December</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, "dataMax + 10"]}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B2C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="transparent"
                fill="url(#colorGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#FF6B2C"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#FF6B2C",
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
                activeDot={{
                  r: 6,
                  fill: "#FF6B2C",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
