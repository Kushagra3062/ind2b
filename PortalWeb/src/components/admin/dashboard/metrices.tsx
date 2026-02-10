import { Package, Users, ShoppingCart, UserPlus, Clock } from "lucide-react"
import { MetricCard } from "./metrices-card"

interface MetricsProps {
  timeFrame: string
  getMetricValue: (baseValue: number) => number
}

export function Metrics({ timeFrame, getMetricValue }: MetricsProps) {
  const metrics = [
    {
      title: "Total Revenue",
      value: getMetricValue(1234567),
      trend: "-4.3%",
      trendLabel: `Down from last ${timeFrame === "weekly" ? "week" : timeFrame === "monthly" ? "month" : "year"}`,
      trendType: "negative" as const,
      icon: Package,
      iconColor: "text-green-500",
      iconBg: "bg-green-50",
      borderColor: "border-green-500",
    },
    {
      title: "Total Sellers",
      value: getMetricValue(1200),
      trend: getMetricValue(8523).toString(),
      trendLabel: "Active Seller",
      trendType: "positive" as const,
      icon: Users,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
      borderColor: "border-purple-500",
    },
    {
      title: "Total Orders",
      value: getMetricValue(12345),
      trend: "1.3%",
      trendLabel: `Up from last ${timeFrame === "weekly" ? "week" : timeFrame === "monthly" ? "month" : "year"}`,
      trendType: "positive" as const,
      icon: ShoppingCart,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50",
      borderColor: "border-yellow-500",
    },
    {
      title: "Active Product",
      value: getMetricValue(5678),
      trend: "1.3%",
      trendLabel: `Up from last ${timeFrame === "weekly" ? "week" : timeFrame === "monthly" ? "month" : "year"}`,
      trendType: "positive" as const,
      icon: Package,
      iconColor: "text-pink-500",
      iconBg: "bg-pink-50",
      borderColor: "border-pink-500",
    },
    {
      title: "New Buyer",
      value: getMetricValue(456),
      trend: "13%",
      trendLabel: timeFrame === "annually" ? "(Last Year)" : timeFrame === "monthly" ? "(Last Month)" : "(Last Week)",
      trendType: "positive" as const,
      icon: UserPlus,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
      borderColor: "border-orange-500",
    },
    {
      title: "Issues Pending Resolution",
      value: getMetricValue(2040),
      trend: "1.8%",
      trendLabel: `Up from last ${timeFrame === "weekly" ? "week" : timeFrame === "monthly" ? "month" : "year"}`,
      trendType: "positive" as const,
      icon: Clock,
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
      borderColor: "border-red-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          {...metric}
          value={typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
        />
      ))}
    </div>
  )
}
