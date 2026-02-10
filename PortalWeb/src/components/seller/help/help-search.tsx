"use client"

import type React from "react"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function HelpSearch() {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", query)
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        type="search"
        placeholder="How can we help you?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 py-6 text-lg rounded-full border-gray-200"
      />
    </form>
  )
}
