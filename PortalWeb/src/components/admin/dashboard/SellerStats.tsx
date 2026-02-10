"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, ResponsiveContainer, Cell, Sector } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const monthlyData = [
  { name: "Approved", value: 590, color: "#22c55e" },
  { name: "Pending", value: 342, color: "#f97316" },
  { name: "Rejected", value: 120, color: "#ef4444" },
]

const weeklyData = [
  { name: "Approved", value: 120, color: "#22c55e" },
  { name: "Pending", value: 85, color: "#f97316" },
  { name: "Rejected", value: 30, color: "#ef4444" },
]

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  )
}

export function SellerStats() {
  const [timeFrame, setTimeFrame] = useState("monthly")
  const [activeIndex, setActiveIndex] = useState(2) // Start with "Rejected" (lowest value) active

  const sellerData = timeFrame === "weekly" ? weeklyData : monthlyData

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Seller Status</CardTitle>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={sellerData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                onMouseEnter={onPieEnter}
              >
                {sellerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">1.05</div>
            <div className="text-sm text-muted-foreground">Average range</div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {sellerData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg transition-colors duration-200 cursor-pointer"
              style={{
                backgroundColor: activeIndex === index ? `${item.color}15` : "transparent",
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
