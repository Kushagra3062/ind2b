"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

export function SalesChart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        fill: true,
        label: "Sales",
        data: [45000, 48000, 42000, 38000, 35000, 30000, 32000],
        borderColor: "rgb(255, 98, 0)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 200)
          gradient.addColorStop(0, "rgba(255, 98, 0, 0.3)")
          gradient.addColorStop(1, "rgba(255, 98, 0, 0)")
          return gradient
        },
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += "₹" + context.parsed.y.toLocaleString("en-IN")
            }
            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value: number | string) => {
            if (typeof value === "number") {
              return "₹" + value.toLocaleString("en-IN", { maximumSignificantDigits: 3 })
            }
            return value
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  )
}
