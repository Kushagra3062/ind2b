"use client"

import { useState } from "react"
import { Header } from "./header"
import { Metrics } from "./metrices"
import { Chart } from "./Chart"

// Chart data
const annualData = [
  { period: "JAN", sales: 2000 },
  { period: "FEB", sales: 2800 },
  { period: "MAR", sales: 1800 },
  { period: "APR", sales: 2400 },
  { period: "MAY", sales: 3200 },
  { period: "JUN", sales: 2900 },
  { period: "JUL", sales: 3100 },
  { period: "AUG", sales: 3348 },
  { period: "SEP", sales: 2600 },
  { period: "OCT", sales: 2200 },
  { period: "NOV", sales: 2000 },
  { period: "DEC", sales: 2800 },
]

const monthlyData = [
  { period: "Week 1", sales: 500 },
  { period: "Week 2", sales: 750 },
  { period: "Week 3", sales: 600 },
  { period: "Week 4", sales: 800 },
]

const weeklyData = [
  { period: "Mon", sales: 100 },
  { period: "Tue", sales: 150 },
  { period: "Wed", sales: 120 },
  { period: "Thu", sales: 180 },
  { period: "Fri", sales: 160 },
  { period: "Sat", sales: 200 },
  { period: "Sun", sales: 140 },
]

export function Dashboard() {
  const [timeFrame, setTimeFrame] = useState("annually")

  const getChartData = () => {
    switch (timeFrame) {
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      case "annually":
      default:
        return annualData
    }
  }

  const getMetricValue = (baseValue: number) => {
    switch (timeFrame) {
      case "weekly":
        return Math.round(baseValue / 52)
      case "monthly":
        return Math.round(baseValue / 12)
      case "annually":
      default:
        return baseValue
    }
  }

  const data = getChartData()
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-6 space-y-8">
        <Header />
        <Metrics timeFrame={timeFrame} getMetricValue={getMetricValue} />
        <Chart timeFrame={timeFrame} setTimeFrame={setTimeFrame} data={data} totalSales={totalSales} />
      </div>
    </main>
  )
}
