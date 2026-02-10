"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, PieChart, Pie, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const monthlyRegistrations = [
  { month: "Jan", users: 150 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 210 },
  { month: "Apr", users: 190 },
  { month: "May", users: 220 },
  { month: "Jun", users: 250 },
  { month: "Jul", users: 180 },
  { month: "Aug", users: 240 },
  { month: "Sep", users: 280 },
  { month: "Oct", users: 300 },
  { month: "Nov", users: 320 },
  { month: "Dec", users: 350 },
]

const weeklyRegistrations = [
  { month: "Mon", users: 50 },
  { month: "Tue", users: 80 },
  { month: "Wed", users: 110 },
  { month: "Thu", users: 90 },
  { month: "Fri", users: 120 },
  { month: "Sat", users: 150 },
  { month: "Sun", users: 80 },
]

const usageData = [
  { name: "Progress", value: 75 },
  { name: "Remaining", value: 25 },
]

export function UserStats() {
  const [timeFrame, setTimeFrame] = useState("monthly")
  const [activeIndex, setActiveIndex] = useState(-1)

  const registrationData = timeFrame === "weekly" ? weeklyRegistrations : monthlyRegistrations

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Total Usages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">4245</div>
              <div className="text-sm text-muted-foreground">Total Recurring</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-sm text-muted-foreground">Recurring</span>
              <span className="font-bold">4245</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-200" />
              <span className="text-sm text-muted-foreground">New Users</span>
              <span className="font-bold">327</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Registered Users</CardTitle>
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
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationData}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "8px",
                  }}
                />
                <Bar
                  dataKey="users"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  onMouseOver={(data, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {registrationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === activeIndex ? "#fb923c" : "#f97316"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
