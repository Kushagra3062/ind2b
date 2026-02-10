"use client"

import { useState } from "react"
import { Header } from "./header"
import { Metrics } from "./metrices"
import { Chart } from "./Chart"
import { UserStats } from "./UserStats"
import { SellerStats } from "./SellerStats"
import { annualData, monthlyData, weeklyData } from "./data"

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
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <UserStats />
          </div>
          <div className="md:row-span-2">
            <SellerStats />
          </div>
        </div>
      </div>
    </main>
  )
}
