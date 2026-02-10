"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calender"
import { format } from "date-fns"
import { CalendarIcon, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the DateRange type to match what Calendar expects
type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

interface OrderFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  dateRange: { from?: Date; to?: Date }
  setDateRange: (value: { from?: Date; to?: Date }) => void
}

export function OrderFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
}: OrderFiltersProps) {
  // Initialize with the passed dateRange, ensuring it matches the expected type
  const [date, setDate] = useState<DateRange>({
    from: dateRange.from || undefined,
    to: dateRange.to,
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Update parent component when date changes
  useEffect(() => {
    setDateRange({ from: date.from, to: date.to })
  }, [date, setDateRange])

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
  }

  // Handle date selection - ensure we maintain the correct type
  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
    } else {
      // If date is cleared, set a valid DateRange with undefined values
      setDate({ from: undefined, to: undefined })
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL_STATUSES")
    setDate({ from: undefined, to: undefined })
    setDateRange({})
  }

  // Format date range for display
  const formatDateRange = () => {
    if (date.from && date.to) {
      return `${format(date.from, "MMM dd, yyyy")} - ${format(date.to, "MMM dd, yyyy")}`
    }
    if (date.from) {
      return `From ${format(date.from, "MMM dd, yyyy")}`
    }
    if (date.to && !date.from) {
      return `Until ${format(date.to, "MMM dd, yyyy")}`
    }
    return "Select date range"
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders by ID, customer, or product..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1.5 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_STATUSES">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal md:w-[240px]",
                !date.from && !date.to && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from || new Date()}
              selected={date}
              onSelect={(range) => {
                handleDateSelect(range || { from: undefined, to: undefined })
                if (range?.to) {
                  setIsCalendarOpen(false)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Reset Filters */}
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="w-full md:w-auto"
          disabled={!searchTerm && statusFilter === "ALL_STATUSES" && !date.from && !date.to}
        >
          Reset Filters
        </Button>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter !== "ALL_STATUSES" || date.from || date.to) && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {searchTerm && <span className="bg-secondary px-2 py-1 rounded-md">Search: {searchTerm}</span>}
          {statusFilter !== "ALL_STATUSES" && (
            <span className="bg-secondary px-2 py-1 rounded-md">Status: {statusFilter}</span>
          )}
          {(date.from || date.to) && (
            <span className="bg-secondary px-2 py-1 rounded-md">Date: {formatDateRange()}</span>
          )}
        </div>
      )}
    </div>
  )
}
