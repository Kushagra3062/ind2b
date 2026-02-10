"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import ProductCard from "@/components/layout/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Product {
  product_id: number
  title: string
  description: string
  image_link: string
  stock: number
  price: number
  final_price?: number
  discount: number
  SKU: string
  seller_id: number
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

export default function BrandProductsPage() {
  const params = useParams()
  const brandSlug = params.brand as string
  const brandName = brandSlug?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrandProducts = async () => {
      if (!brandSlug) return

      try {
        setLoading(true)
        const response = await fetch(`/api/products?q=${encodeURIComponent(brandName)}&limit=50`)
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const productsData = await response.json()

        // Filter products that match the brand name (in brand field or seller_name)
        const filteredProducts = productsData.filter(
          (product: Product) =>
            product.seller_name?.toLowerCase().includes(brandName.toLowerCase()) ||
            (product as any).brand?.toLowerCase().includes(brandName.toLowerCase()),
        )

        setProducts(filteredProducts)
        setError(null)
      } catch (err) {
        console.error("Error fetching brand products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchBrandProducts()
  }, [brandSlug, brandName])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{brandName} Products</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{brandName} Products</h1>
        <p className="text-gray-600 mb-4">
          Discover {products.length} products from {brandName}
        </p>
        {products.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from(new Set(products.map((p) => p.category_name)))
              .slice(0, 5)
              .map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found for {brandName}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.product_id}
              title={product.title}
              company={product.seller_name}
              location={product.location}
              price={product.price}
              final_price={product.final_price}
              originalPrice={product.price / (1 - (product.discount || 0) / 100)}
              discount={product.discount || 0}
              image_link={product.image_link}
              hoverImage={product.image_link}
              href={`/products/${product.product_id}`}
              rating={product.rating || 0}
              seller_id={product.seller_id}
              stock={product.stock}
            />
          ))}
        </div>
      )}
    </div>
  )
}
