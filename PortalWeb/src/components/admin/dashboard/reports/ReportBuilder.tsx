"use client"

import { useState } from "react"
import { ReportHeader } from "./ReportHeader"
import { VisualizationPanel } from "./VisualizationPanel"
import { ReportCanvas } from "./ReportCanvas"
import type { DateRange } from "react-day-picker"

export function ReportBuilder() {
  const [selectedDate, setSelectedDate] = useState<DateRange>({
    from: new Date(2024, 0, 20),
    to: new Date(2024, 0, 30),
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <ReportHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <div className="grid gap-4 md:grid-cols-[1fr,300px]">
          <ReportCanvas selectedDate={selectedDate} />
          <VisualizationPanel />
        </div>
      </div>
    </div>
  )
}
