import { Star, ThumbsUp, CheckCircle, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number
  type: "total" | "pending" | "approved" | "flagged"
}

export function StatsCard({ title, value, type }: StatsCardProps) {
  const icons = {
    total: Star,
    pending: ThumbsUp,
    approved: CheckCircle,
    flagged: Flag,
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-4 shadow-sm max-w-[200px] mx-auto",
        type === "total" && "border-yellow-400",
        type === "pending" && "border-orange-400",
        type === "approved" && "border-green-400",
        type === "flagged" && "border-red-400",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "p-1.5 rounded-lg",
            type === "total" && "bg-yellow-100 text-yellow-600",
            type === "pending" && "bg-orange-100 text-orange-600",
            type === "approved" && "bg-green-100 text-green-600",
            type === "flagged" && "bg-red-100 text-red-600",
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className="flex justify-center">
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}
