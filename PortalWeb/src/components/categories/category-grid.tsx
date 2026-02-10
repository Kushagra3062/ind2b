"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Package } from "lucide-react"

interface Category {
  name: string
  count: number
  sampleImage: string
  avgPrice: number
  subcategories: string[]
}

let categoryCache: { data: Category[]; timestamp: number } | null = null
const CACHE_DURATION = 20 * 60 * 1000 // 20 minutes

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const CATEGORIES_PER_PAGE = 7
  const AUTO_SCROLL_INTERVAL = 5000
  const FEATURED_CATEGORIES_COUNT = 6

  const fetchCategories = useCallback(async () => {
    try {
      if (categoryCache && Date.now() - categoryCache.timestamp < CACHE_DURATION) {
        if (isMountedRef.current) {
          setCategories(categoryCache.data)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      const categoriesData = Array.isArray(data) ? data : []

      categoryCache = {
        data: categoriesData,
        timestamp: Date.now(),
      }

      if (isMountedRef.current) {
        setCategories(categoriesData)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load categories")
        console.error("Error fetching categories:", err)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    setIsMounted(true)
    fetchCategories()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchCategories])

  useEffect(() => {
    if (!isMounted || !categories || categories.length <= CATEGORIES_PER_PAGE) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setCurrentIndex((prevIndex) => {
          const maxIndex = categories.length - 1
          return prevIndex >= maxIndex ? 0 : prevIndex + 1
        })
      }
    }, AUTO_SCROLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [categories, isMounted, CATEGORIES_PER_PAGE])

  const visibleCategories = useMemo(() => {
    if (!categories || categories.length === 0) return []

    const visible = []
    for (let i = 0; i < CATEGORIES_PER_PAGE; i++) {
      const categoryIndex = (currentIndex + i) % categories.length
      visible.push({
        ...categories[categoryIndex],
        key: `${categories[categoryIndex].name}-${categoryIndex}`,
      })
    }
    return visible
  }, [categories, currentIndex, CATEGORIES_PER_PAGE])

  const featuredCategories = useMemo(() => {
    if (!categories || categories.length === 0) return []
    return [...categories].sort((a, b) => b.count - a.count).slice(0, FEATURED_CATEGORIES_COUNT)
  }, [categories, FEATURED_CATEGORIES_COUNT])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-900" />
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4">Error loading categories</div>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No categories found</p>
      </div>
    )
  }

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-900" />
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-200">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Shop by Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our wide range of products organized by categories to help you find exactly what you need
          </p>
        </div>

        {/* Categories Carousel */}
        <div className="w-[95%] mx-auto overflow-hidden mb-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6 transition-all duration-1000 ease-in-out">
            {visibleCategories.map((category) =>
              category.name && category.name !== "undefined" ? (
                <Link key={category.key} href={`/categories/${encodeURIComponent(category.name)}`} className="group">
                  <div className="flex flex-col items-center text-center transition-all duration-300 hover:scale-105">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-3 md:mb-4 rounded-full overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 group-hover:border-green-900">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-green-50 group-hover:to-green-100 transition-all duration-300" />
                      <div className="relative w-full h-full flex items-center justify-center p-3 md:p-4">
                        <Image
                          src={category.sampleImage || "/placeholder.svg?height=80&width=80"}
                          alt={category.name}
                          width={80}
                          height={80}
                          className="object-contain transition-all duration-300 group-hover:scale-110 w-full h-full"
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-green-900 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-full" />
                    </div>

                    {/* Category Info */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-green-900 transition-colors duration-300 leading-tight text-center px-1">
                        {category.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 group-hover:text-green-700 transition-colors duration-300">
                        {category.count} products
                      </p>
                    </div>
                  </div>
                </Link>
              ) : null,
            )}
          </div>

          {/* Auto-scroll indicator */}
          {categories.length > CATEGORIES_PER_PAGE && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(categories.length, 10) }, (_, index) => (
                  <div
                    key={`indicator-${index}`}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex % Math.min(categories.length, 10) ? "bg-green-900 w-4" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Categories Section */}
        {featuredCategories.length > 0 && (
          <div className="w-[95%] mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Categories</h3>
              <p className="text-gray-600">Explore our most popular product categories</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredCategories.map((category) =>
                category.name && category.name !== "undefined" ? (
                  <Link
                    key={`featured-${category.name}`}
                    href={`/categories/${encodeURIComponent(category.name)}`}
                    className="group relative overflow-hidden rounded-lg bg-gray-100 block transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  >
                    <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                      <div className="absolute inset-0">
                        <Image
                          src={category.sampleImage || "/placeholder.svg?height=300&width=400"}
                          alt={category.name}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=300&width=400"
                          }}
                        />
                      </div>

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <h4 className="text-white font-bold text-lg md:text-xl mb-1 group-hover:text-white transition-colors duration-300 leading-tight uppercase">
                          {category.name}
                        </h4>
                        <p className="text-white/80 text-sm mb-2">Collection</p>
                        <p className="text-white/70 text-xs">{category.count} products available</p>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-lg transition-all duration-300" />
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
