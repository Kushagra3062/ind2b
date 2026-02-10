import { BarChart3, LineChart, PieChart, Table2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const visualizations = [
  {
    title: "Bar Chart",
    description: "Compare quantities over categories (e.g., monthly sales)",
    icon: BarChart3,
  },
  {
    title: "Line Chart",
    description: "Track trends over time (e.g., revenue growth)",
    icon: LineChart,
  },
  {
    title: "Pie Chart",
    description: "Display proportions (e.g., product category sales distribution)",
    icon: PieChart,
  },
  {
    title: "Tables",
    description: "Detailed data views (e.g., seller-wise or product-wise breakdown)",
    icon: Table2,
  },
]

export function VisualizationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Add Visual Elements</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {visualizations.map((item) => (
          <div
            key={item.title}
            className="flex cursor-move items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
            draggable
          >
            <div className="rounded-lg bg-orange-100 p-2">
              <item.icon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
