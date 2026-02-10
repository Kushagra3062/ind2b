"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown } from "lucide-react"

type Suggestion = {
  text: string
  type: "category" | "product"
  description: string
}

export default function EnhancedSearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [categories, setCategories] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>()

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🔄 Fetching categories...")
        setLoadingCategories(true)
        const response = await fetch("/api/categories/unique")
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Fetched categories:", data)
          setCategories(Array.isArray(data) ? data : [])
        } else {
          console.error("❌ Failed to fetch categories:", response.status)
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Debounced search suggestions
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          console.log(`🔄 Fetching suggestions for: "${searchQuery}"`)
          setLoadingSuggestions(true)
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`)
          if (response.ok) {
            const data = await response.json()
            console.log("✅ Fetched suggestions:", data)
            setSuggestions(Array.isArray(data) ? data : [])
            setShowSuggestions(data.length > 0)
          }
        } catch (error) {
          console.error("❌ Error fetching suggestions:", error)
        } finally {
          setLoadingSuggestions(false)
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (query?: string, category?: string) => {
    const searchTerm = query !== undefined ? query : searchQuery.trim()
    const searchCategory =
      category !== undefined ? category : selectedCategory !== "All Categories" ? selectedCategory : ""

    console.log(`🔍 SEARCH TRIGGERED:`)
    console.log(`  - Search Term: "${searchTerm}"`)
    console.log(`  - Category: "${searchCategory}"`)

    if (!searchTerm && !searchCategory) {
      console.log("❌ No search term or category provided")
      return
    }

    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    if (searchCategory) params.set("category", searchCategory)

    const searchUrl = `/search?${params.toString()}`
    console.log(`🚀 Navigating to: ${searchUrl}`)

    router.push(searchUrl)
    setShowSuggestions(false)
    setShowCategoryDropdown(false)
  }

  const handleCategorySelect = (category: string) => {
    console.log(`📂 Category selected: "${category}"`)
    setSelectedCategory(category)
    setShowCategoryDropdown(false)

    // Always perform search when category is selected
    if (category !== "All Categories") {
      // Clear search query and search by category only
      setSearchQuery("")
      handleSearch("", category)
    } else {
      // If "All Categories" selected and there's a search query, search without category filter
      if (searchQuery.trim()) {
        handleSearch(searchQuery.trim(), "")
      }
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    console.log(`💡 Suggestion clicked:`, suggestion)

    if (suggestion.type === "category") {
      setSelectedCategory(suggestion.text)
      setSearchQuery("")
      handleSearch("", suggestion.text)
    } else {
      setSearchQuery(suggestion.text)
      handleSearch(suggestion.text, selectedCategory !== "All Categories" ? selectedCategory : "")
    }
    setShowSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      console.log("⌨️ Enter key pressed - triggering search")
      handleSearch()
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Search Container */}
      <div className="relative flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
        {/* Search Icon */}
        <div className="pl-4 pr-2">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Search Input */}
        <div ref={searchRef} className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for anything"
            className="w-full py-3 px-2 bg-transparent border-none outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
          />

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {loadingSuggestions ? (
                <div className="px-4 py-3 text-gray-500 bg-white">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading suggestions...</span>
                  </div>
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none bg-white text-black border-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-black">{suggestion.text}</div>
                        <div className="text-sm text-gray-500">{suggestion.description}</div>
                      </div>
                      <div className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">
                        {suggestion.type}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div ref={categoryRef} className="relative border-l border-gray-200">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center space-x-2 px-4 py-3 bg-white text-black hover:bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 rounded-r-full"
          >
            <span className="text-sm font-medium text-black truncate max-w-32">{selectedCategory}</span>
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          </button>

          {/* Category Dropdown Menu */}
          {showCategoryDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {loadingCategories ? (
                <div className="px-3 py-2 text-gray-500 bg-white cursor-not-allowed">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleCategorySelect("All Categories")}
                    className={`w-full px-3 py-2 text-left text-black bg-white hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                      selectedCategory === "All Categories" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-3 py-2 text-left text-black bg-white hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                        selectedCategory === category ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
