"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface YearMonthPickerProps {
  className?: string
  selected: Date | null
  onSelect: (date: Date) => void
  onClear: () => void
}

export function YearMonthPicker({ className, selected, onSelect, onClear }: YearMonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentDate, setCurrentDate] = React.useState(selected || new Date())

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1)
    setCurrentDate(newDate)
    onSelect(newDate)
  }

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1)
    setCurrentDate(newDate)
    onSelect(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(Number.parseInt(year), currentDate.getMonth())
    setCurrentDate(newDate)
    onSelect(newDate)
  }

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentDate.getFullYear(), Number.parseInt(month))
    setCurrentDate(newDate)
    onSelect(newDate)
  }

  const handleClear = () => {
    onClear()
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[240px] justify-start text-left font-normal", !selected && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, "MMMM yyyy") : "All Dates"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between p-2">
            <Button variant="outline" className="h-7 w-7 bg-transparent p-0" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">{format(currentDate, "MMMM yyyy")}</div>
            <Button variant="outline" className="h-7 w-7 bg-transparent p-0" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-2 flex gap-2">
            <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                    {new Date().getFullYear() - i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(2000, i, 1), "MMMM")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between p-2">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button
              onClick={() => {
                onSelect(currentDate)
                setOpen(false)
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
