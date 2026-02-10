import { Card, CardContent } from "@/components/ui/card"
import type { StatCardProps } from "@/types/dashboard"
import { ArrowDown, ArrowUp } from "lucide-react"

export function StatCard({ title, value, change, icon }: StatCardProps) {
  // Format value with rupee symbol for revenue-related cards
  const formatValue = (val: string | number, cardTitle: string) => {
    if (cardTitle.toLowerCase().includes("revenue")) {
      return `${val}`
    }
    return val
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Card content container */}
        <div className="flex items-center justify-between">
          {/* Left side - Statistics information */}
          <div>
            {/* Card title */}
            <p className="text-sm text-muted-foreground">{title}</p>
            {/* Main value display */}
            <h3 className="text-2xl font-bold mt-1">{formatValue(value, title)}</h3>
            {/* Change indicator section */}
            <div className="flex items-center mt-1">
              {/* Conditional rendering of increase/decrease arrow */}
              {change.type === "increase" ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              {/* Change value with conditional color */}
              <span className={`text-sm ${change.type === "increase" ? "text-green-500" : "text-red-500"}`}>
                {change.value}
              </span>
              {/* Time period text */}
              <span className="text-sm text-muted-foreground ml-1">{change.period}</span>
            </div>
          </div>
          {/* Right side - Icon container */}
          <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
