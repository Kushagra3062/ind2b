import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  trend: string
  trendLabel: string
  trendType: "positive" | "negative"
  icon: LucideIcon
  iconColor: string
  iconBg: string
  borderColor: string
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  trendType,
  icon: Icon,
  iconColor,
  iconBg,
  borderColor,
}: MetricCardProps) {
  return (
    <Card className={`border-t-4 ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h2 className="text-2xl font-bold md:text-3xl">
              {title.toLowerCase().includes("revenue") ? `₹${value}` : value}
            </h2>
            <p
              className={`flex items-center text-sm mt-1 ${
                trendType === "positive" ? "text-green-500" : "text-red-500"
              }`}
            >
              <span>
                {trend} {trendLabel}
              </span>
            </p>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
