"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CheckboxListProps {
  title: string
  items: string[]
  selectedItems: string[]
  onItemToggle: (item: string) => void
  className?: string
}

export function CheckboxList({ title, items, selectedItems, onItemToggle, className }: CheckboxListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = items.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {title}
            <span className="text-red-500">*</span>
          </label>
          <span className="inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-primary rounded-full">
            {selectedItems.length}
          </span>
        </div>
        <div className="relative">
          <Input
            placeholder="Select Category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      <ScrollArea className="h-[300px] border rounded-md p-4">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox id={item} checked={selectedItems.includes(item)} onCheckedChange={() => onItemToggle(item)} />
              <label
                htmlFor={item}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
