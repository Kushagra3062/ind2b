"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRevenueData, getOrderSummaryData } from "@/actions/admin-orders"

export default function ChartsSection() {
  const [revenueData, setRevenueData] = useState([
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
  ])

  const [orderSummaryData, setOrderSummaryData] = useState([
    { name: "Pending Orders", value: 0, color: "#ff4d4f" },
    { name: "Shipped Orders", value: 0, color: "#52c41a" },
    { name: "Delivered Orders", value: 0, color: "#1890ff" },
  ])

  const [dateRange, setDateRange] = useState("last7days")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)

        // Fetch revenue data
        const revData = await getRevenueData()
        if (revData && revData.length > 0) {
          setRevenueData(revData)
        }

        // Fetch order summary data
        const summaryData = await getOrderSummaryData()
        if (summaryData && summaryData.length > 0) {
          setOrderSummaryData(summaryData)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()

    // Set up polling for real-time updates (every 60 seconds)
    const interval = setInterval(fetchChartData, 60000)

    return () => clearInterval(interval)
  }, [dateRange])

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-[#ff4d4f]">{`Revenue: ₹${payload[0].value.toLocaleString()}`}</p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for the pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium" style={{ color: payload[0].payload.color }}>
            {payload[0].name}
          </p>
          <p>{`Count: ${payload[0].value}`}</p>
          <p>{`Percentage: ${((payload[0].value / orderSummaryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className={loading ? "animate-pulse" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Revenue</span>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#ff4d4f" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={loading ? "animate-pulse" : ""}>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderSummaryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {orderSummaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
