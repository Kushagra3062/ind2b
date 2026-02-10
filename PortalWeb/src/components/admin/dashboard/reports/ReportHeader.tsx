"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "./DatePickerWithRange"
import type { DateRange } from "react-day-picker"
import Link from "next/link"

interface ReportHeaderProps {
  selectedDate: DateRange
  onDateChange: (date: DateRange) => void
}

export function ReportHeader({ selectedDate, onDateChange }: ReportHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-orange-100 p-2">
            <Calendar className="h-5 w-5 text-orange-500" />
          </div>
          <h1 className="text-xl font-semibold">Custom Reports Builder</h1>
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DatePickerWithRange date={selectedDate} onDateChange={onDateChange} />
        <Button variant="outline" className="w-full sm:w-auto">
          Export to PDF
        </Button>
        <Button variant="outline" className="w-full sm:w-auto">
          Export to CSV
        </Button>
      </div>
    </div>
  )
}
