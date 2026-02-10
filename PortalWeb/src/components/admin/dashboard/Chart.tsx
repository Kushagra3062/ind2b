"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChartProps {
  timeFrame: string
  setTimeFrame: (value: string) => void
  data: Array<{ period: string; sales: number }>
  totalSales: number
}

export function Chart({ timeFrame, setTimeFrame, data, totalSales }: ChartProps) {
  const getChartTitle = () => {
    switch (timeFrame) {
      case "weekly":
        return "Weekly Sales"
      case "monthly":
        return "Monthly Sales"
      case "annually":
      default:
        return "Annual Sales"
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">{getChartTitle()} 2022</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${totalSales.toLocaleString()}</span>
              <span className="text-sm text-green-500">1.3% VS LAST YEAR</span>
            </div>
          </div>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#f97316" fill="#ffedd5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
