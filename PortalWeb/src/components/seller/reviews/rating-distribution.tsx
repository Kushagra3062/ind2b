import { BarChart } from "recharts"

interface RatingDistributionProps {
  distribution: number[]
}

export function RatingDistribution({ distribution }: RatingDistributionProps) {
  const data = [
    { name: "1 Star", value: distribution[0] },
    { name: "2 Star", value: distribution[1] },
    { name: "3 Star", value: distribution[2] },
    { name: "4 Star", value: distribution[3] },
    { name: "5 Star", value: distribution[4] },
  ]

  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"]

  return (
    <div className="h-[200px] w-full">
      <p>Hiii</p>
    </div>
  )
}
