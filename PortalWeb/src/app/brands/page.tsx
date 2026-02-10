"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Brand {
  name: string
  productCount: number
  avgPrice: number
  totalStock: number
  avgRating: number
  sampleImage: string
  categories: string[]
  href: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/brands?limit=50")
        if (!response.ok) {
          throw new Error("Failed to fetch brands")
        }
        const brandsData = await response.json()
        setBrands(brandsData)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Brands</h1>
          <p className="text-gray-600">Explore all available brands</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="p-6">
              <CardContent className="flex flex-col items-center space-y-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Brands</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Brands</h1>
        <p className="text-gray-600">Explore all {brands.length} available brands</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <Link key={brand.name} href={brand.href}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-20 h-20 rounded-full bg-white shadow-md overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                    <Image
                      src={brand.sampleImage || "/placeholder.svg?height=80&width=80&query=brand+logo"}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{brand.productCount} products</p>
                    {brand.avgRating > 0 && (
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600 ml-1">{brand.avgRating}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 justify-center">
                      {brand.categories.slice(0, 2).map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {brand.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{brand.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
