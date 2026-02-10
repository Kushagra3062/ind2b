"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Suspense } from "react"
import ProductCard from "@/components/layout/product-card"

type Product = {
  product_id: string
  title: string
  image_link?: string
  brand?: string
  category_name?: string
  price: number
  final_price?: number // added final_price field
  original_price: number
  rating?: number
  stock?: number
  discount?: number
  seller_name?: string
  seller_id?: number
  sub_category_name?: string
  delivery_option?: string
  units?: string
  location?: string
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      console.log(`🔍 SEARCH PAGE: Fetching results for query="${query}", category="${category}"`)

      if (!query.trim() && !category.trim()) {
        console.log("❌ No search parameters provided")
        setResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        if (category.trim()) params.set("category", category.trim())

        const apiUrl = `/api/products?${params.toString()}`
        console.log(`🚀 Calling API: ${apiUrl}`)

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ API Response:`, data)

        if (Array.isArray(data)) {
          setResults(data)
          console.log(`📦 Set ${data.length} products in results`)
        } else {
          console.error("❌ API response is not an array:", data)
          setError("Invalid response format from API")
        }
      } catch (err) {
        console.error("❌ Search error:", err)
        setError("Failed to load search results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, category])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const getResultsTitle = () => {
    if (query && category) {
      return `Search Results for "${query}" in ${category}`
    } else if (query) {
      return `Search Results for "${query}"`
    } else if (category) {
      return `Products in ${category}`
    }
    return "Search Results"
  }

  const getResultsDescription = () => {
    if (query && category) {
      return `Found ${results.length} products for "${query}" in ${category}`
    } else if (query) {
      return `Found ${results.length} products for "${query}"`
    } else if (category) {
      return `Found ${results.length} products in ${category}`
    }
    return `Found ${results.length} products`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Results Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{getResultsTitle()}</h1>
        <div className="text-gray-600">
          <p>{getResultsDescription()}</p>
        </div>
      </div>

      {/* Search Results */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {query && category
              ? `No products found for "${query}" in ${category}. Try adjusting your search terms.`
              : query
                ? `No products found for "${query}". Try different keywords or browse categories.`
                : category
                  ? `No products found in ${category}. This category might be empty.`
                  : "Try searching for products or browse our categories."}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/categories"
              className="bg-green-900 text-white px-6 py-2 rounded hover:bg-green-800 transition-colors inline-block"
            >
              Browse Categories
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((product) => (
            <ProductCard
              key={product.product_id}
              title={product.title}
              company={product.brand || product.seller_name || "Unknown Brand"}
              location={product.location || "Delhi"}
              price={product.price}
              final_price={product.final_price} // pass final_price prop
              originalPrice={product.original_price || product.price}
              discount={product.discount || 0}
              image_link={product.image_link || "/placeholder.svg?height=200&width=200"}
              hoverImage={product.image_link || "/placeholder.svg?height=200&width=200"}
              href={`/products/${product.product_id}`}
              rating={product.rating || 0}
              seller_id={product.seller_id || 0}
              units={product.units}
              stock={product.stock || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading search results...</p>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  )
}
