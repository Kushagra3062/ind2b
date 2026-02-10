"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ProductCard from "@/components/layout/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Filter, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  product_id: number
  title: string
  description?: string
  image_link: string
  stock: number
  price: number
  final_price?: number // added final_price field
  discount: number
  SKU: string
  seller_id: number
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

interface CategoryProductsPageProps {
  category: string
  subcategory?: string
  sortBy?: string
  sortOrder?: string
  page?: string
}

export default function CategoryProductsPage({
  category,
  subcategory,
  sortBy = "created_at",
  sortOrder = "desc",
  page = "1",
}: CategoryProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [pagination, setPagination] = useState<any>({})

  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPage = Number.parseInt(page)
  const limit = 20

  useEffect(() => {
    fetchProducts()
  }, [category, subcategory, sortBy, sortOrder, currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
        sortBy,
        sortOrder,
      })

      if (subcategory) {
        params.append("subcategory", subcategory)
      }

      const response = await fetch(`/api/products/category/${encodeURIComponent(category)}?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products || [])
      setSubcategories(data.subcategories || [])
      setTotalCount(data.totalCount || 0)
      setPagination(data.pagination || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 when filters change
    if (key !== "page") {
      params.set("page", "1")
    }

    router.push(`/categories/${encodeURIComponent(category)}?${params.toString()}`)
  }

  const goToPage = (pageNum: number) => {
    updateFilters("page", pageNum.toString())
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-900" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-red-500 mb-4">Error loading products</div>
          <Button onClick={fetchProducts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-green-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-green-900">
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category}</span>
        {subcategory && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{subcategory}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcategory || category}</h1>
          <p className="text-gray-600">{totalCount} products found</p>
        </div>

        <Link href="/categories">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Subcategory Filter */}
        {subcategories.length > 0 && (
          <Select value={subcategory || ""} onValueChange={(value) => updateFilters("subcategory", value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(value) => updateFilters("sortBy", value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Newest</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="title">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={(value) => updateFilters("sortOrder", value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">High to Low</SelectItem>
            <SelectItem value="asc">Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-500 mb-4">No products found in this category</div>
          <Link href="/categories">
            <Button variant="outline">Browse Other Categories</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard
                key={product.product_id}
                title={product.title}
                company={product.seller_name}
                location={product.location}
                price={product.price}
                final_price={product.final_price} // pass final_price prop
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i
                  if (pageNum > pagination.totalPages) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
