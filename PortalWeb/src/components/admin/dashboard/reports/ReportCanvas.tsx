"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DateRange } from "react-day-picker"

interface ReportCanvasProps {
  selectedDate: DateRange
}

const data = [
  { date: "Mon 10", sales: 4200 },
  { date: "Tue 11", sales: 4500 },
  { date: "Wed 12", sales: 4800 },
  { date: "Thu 13", sales: 4300 },
  { date: "Fri 14", sales: 4890 },
  { date: "Sat 15", sales: 4200 },
]

export function ReportCanvas({ selectedDate }: ReportCanvasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Sales Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#salesGradient)"
                dot={{ fill: "#f97316" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex h-[100px] cursor-move items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-center text-sm text-muted-foreground">
              Drag and drop visualizations
              <br />
              onto a report canvas
            </p>
          </div>
          <div className="flex h-[100px] cursor-move items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-center text-sm text-muted-foreground">
              Drag and drop visualizations
              <br />
              onto a report canvas
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
