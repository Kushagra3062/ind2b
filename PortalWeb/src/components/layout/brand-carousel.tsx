"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Brand {
  name: string
  productCount: number
  avgPrice: number
  totalStock: number
  avgRating: number
  sampleImage: string | null
  categories: string[]
  href: string
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

function BrandCard({ brand }: { brand: Brand }) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={brand.href}
      className="group flex flex-col items-center p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-3 overflow-hidden rounded-full bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-gray-200 group-hover:border-blue-300">
        <Image
          src={
            imageError || !brand.sampleImage
              ? "/placeholder.svg?height=120&width=120&query=brand+logo"
              : brand.sampleImage
          }
          alt={`${brand.name} logo`}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-110 p-2 sm:p-3"
          onError={() => setImageError(true)}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-full" />
      </div>
      <div className="text-center">
        <h3 className="text-sm sm:text-base font-medium text-gray-800 group-hover:text-gray-900 transition-colors duration-300 mb-1">
          {brand.name}
        </h3>
        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
          {brand.productCount} products
        </p>
        {brand.avgRating > 0 && (
          <div className="flex items-center justify-center mt-1">
            <span className="text-xs text-yellow-500">★</span>
            <span className="text-xs text-gray-500 ml-1">{brand.avgRating}</span>
          </div>
        )}
        {brand.categories.length > 0 && (
          <p className="text-xs text-blue-600 mt-1 truncate max-w-24">{brand.categories[0]}</p>
        )}
      </div>
    </Link>
  )
}

function BrandCardSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-3 rounded-full bg-gray-200" />
      <div className="text-center">
        <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-14" />
      </div>
    </div>
  )
}

export function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [visibleBrands, setVisibleBrands] = useState<Brand[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        console.log("Fetching authorized brands from CategoryBrand model...")
        const response = await fetch("/api/brands?limit=20")
        if (!response.ok) {
          throw new Error("Failed to fetch brands")
        }
        const brandsData = await response.json()
        console.log("Received brands data:", brandsData)
        setBrands(brandsData)
        setVisibleBrands(brandsData.slice(0, 6))
        setError(null)
      } catch (err) {
        console.error("Error fetching brands:", err)
        setError("Failed to load brands")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const updateBrands = useCallback(() => {
    if (brands.length === 0) return

    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % brands.length
      setVisibleBrands((prevBrands) => {
        const newBrands = [...prevBrands]
        newBrands.shift() // Remove the first brand
        newBrands.push(brands[(nextIndex + 5) % brands.length]) // Add the next brand
        return newBrands
      })
      return nextIndex
    })
  }, [brands])

  useInterval(updateBrands, brands.length > 6 ? 15000 : null)

  if (loading) {
    return (
      <section className="w-full px-4 py-2 sm:py-6 bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Trending Brands</h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Discover products from authorized brands on our platform
            </p>
          </div>
          <ScrollArea className="w-full whitespace-nowrap rounded-lg">
            <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-none">
                  <BrandCardSkeleton />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="w-full px-4 py-4 sm:py-6 bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Trending Brands</h2>
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (brands.length === 0) {
    return (
      <section className="w-full px-4 py-4 sm:py-6 bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Trending Brands</h2>
            <p className="text-gray-600 text-sm sm:text-base">No authorized brands found</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full px-4 py-4 sm:py-6 bg-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Trending Brands</h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Discover products from authorized brands on our platform
          </p>
        </div>

        {/* Brands Grid */}
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
          <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8 p-4">
            {visibleBrands.map((brand, i) => (
              <div key={`${brand.name}-${i}`} className="flex-none">
                <BrandCard brand={brand} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Brand Count Info */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {Math.min(visibleBrands.length, 6)} of {brands.length} authorized brands
          </p>
        </div>
      </div>
    </section>
  )
}
