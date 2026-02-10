import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "./star-rating"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  growth?: number
  showStars?: boolean
  children?: React.ReactNode
}

export function StatsCard({ title, value, subtitle, growth, showStars, children }: StatsCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-semibold">{value}</span>
          {growth !== undefined && (
            <span className={`text-sm font-medium ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}%
            </span>
          )}
        </div>
        {showStars && typeof value === "number" && (
          <div className="mt-2">
            <StarRating rating={value} size="sm" />
          </div>
        )}
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
