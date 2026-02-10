import type React from "react"
// Define the structure for statistics card props
export interface StatCardProps {
  title: string // Title of the stat card
  value: string | number // Main value to display
  change: {
    type: "increase" | "decrease" // Whether the change is positive or negative
    value: string // The change value
    period: string // Time period for the change
  }
  icon: React.ReactNode // Icon to display on the card
}

// Define the structure for pending items card props
export interface PendingCardProps {
  title: string // Title of the pending card
  value: number // Number of pending items
  change: {
    value: string // The change value
    period: string // Time period for the change
  }
  icon: React.ReactNode // Icon to display on the card
}

// Define the structure for sales chart data points
export interface SalesDataPoint {
  date: string // Date for the data point
  value: number // Sales value for that date
}
