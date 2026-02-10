"use client"

import { useState, useEffect, useCallback, memo } from "react"
import ProductCard from "./product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { fetchProducts, fetchProductsByCategory } from "@/store/slices/productSlice"
import { LazySection } from "./lazy-section"
import { SectionSkeleton } from "./section-skeleton"
import { generateProductUrl } from "@/lib/utils"
import { requestIdleCallback } from "@/lib/request-idle-callback-polyfill"

// Optimized loading skeleton component
const Skeleton = memo(({ className = "", ...props }: { className?: string; [key: string]: any }) => {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} {...props} />
})

Skeleton.displayName = "Skeleton"

// Optimized loading placeholder component
const ProductCardSkeleton = memo(() => {
  return (
    <div className="border rounded-lg p-4 h-[350px] flex flex-col">
      <Skeleton className="w-full h-40 rounded-md mb-4" />
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-2" />
      <Skeleton className="w-1/4 h-4 mb-4" />
      <div className="mt-auto">
        <Skeleton className="w-2/3 h-6" />
      </div>
    </div>
  )
})

ProductCardSkeleton.displayName = "ProductCardSkeleton"

interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: object
  image_link: string
  stock: number
  price: number
  final_price?: number
  discount: number
  SKU: string
  seller_id: number
  created_at?: string
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

// Memoized product carousel component
const ProductCarousel = memo(
  ({
    products,
    title,
    isLoading,
    category,
    onLoadMore,
  }: {
    products: Product[]
    title: string
    isLoading: boolean
    category?: string
    onLoadMore?: () => void
  }) => {
    const [startIndex, setStartIndex] = useState(0)
    const [visibleProducts, setVisibleProducts] = useState(6)

    // Optimized resize handler with debouncing
    useEffect(() => {
      let timeoutId: NodeJS.Timeout

      const handleResize = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (window.innerWidth >= 1280) {
            setVisibleProducts(6)
          } else if (window.innerWidth >= 1024) {
            setVisibleProducts(4)
          } else if (window.innerWidth >= 768) {
            setVisibleProducts(3)
          } else if (window.innerWidth >= 640) {
            setVisibleProducts(2)
          } else {
            setVisibleProducts(1)
          }
        }, 100)
      }

      handleResize()
      window.addEventListener("resize", handleResize, { passive: true })
      return () => {
        window.removeEventListener("resize", handleResize)
        clearTimeout(timeoutId)
      }
    }, [])

    // Optimized navigation handlers
    const handlePrevious = useCallback(() => {
      setStartIndex((prevIndex) => (prevIndex === 0 ? Math.max(0, products.length - visibleProducts) : prevIndex - 1))
    }, [products.length, visibleProducts])

    const handleNext = useCallback(() => {
      setStartIndex((prevIndex) => {
        const nextIndex = prevIndex >= products.length - visibleProducts ? 0 : prevIndex + 1

        // Load more products when reaching near the end
        if (nextIndex >= products.length - visibleProducts - 2 && onLoadMore) {
          requestIdleCallback(() => onLoadMore())
        }

        return nextIndex
      })
    }, [products.length, visibleProducts, onLoadMore])

    // Ensure we don't go out of bounds
    const safeStartIndex = Math.min(startIndex, Math.max(0, products.length - visibleProducts))
    const currentProducts = products.slice(safeStartIndex, safeStartIndex + visibleProducts)

    const getResponsiveClass = useCallback((visibleCount: number) => {
      switch (visibleCount) {
        case 1:
          return "sm:w-full"
        case 2:
          return "sm:w-1/2"
        case 3:
          return "sm:w-1/2 md:w-1/3"
        case 4:
          return "sm:w-1/2 md:w-1/3 lg:w-1/4"
        default:
          return "sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
      }
    }, [])

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
        <div className="relative">
          <div className="flex overflow-hidden">
            {isLoading ? (
              Array(visibleProducts)
                .fill(0)
                .map((_, index) => (
                  <div key={`skeleton-${index}`} className={`w-full px-2 ${getResponsiveClass(visibleProducts)}`}>
                    <ProductCardSkeleton />
                  </div>
                ))
            ) : products.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product.product_id} className={`w-full px-2 ${getResponsiveClass(visibleProducts)}`}>
                  <ProductCard
                    title={product.title}
                    company={product.seller_name}
                    location={product.location}
                    price={product.price}
                    final_price={product.final_price}
                    discount={product.discount}
                    image_link={product.image_link || "/placeholder.svg?height=200&width=200"}
                    href={generateProductUrl(product.product_id, product.title)}
                    rating={product.rating}
                    originalPrice={product.price + product.discount}
                    hoverImage={product.image_link || "/placeholder.svg?height=200&width=200"}
                    seller_id={product.seller_id}
                    stock={product.stock}
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-gray-500">No products available in this category</p>
              </div>
            )}
          </div>
          {!isLoading && products.length > visibleProducts && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800"
                aria-label="Next product"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    )
  },
)

ProductCarousel.displayName = "ProductCarousel"

// Lazy loaded category section with optimizations
const LazyCategorySection = memo(
  ({
    category,
    subcategories,
  }: {
    category: string
    subcategories: Record<string, Product[]>
  }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [hasLoadedMore, setHasLoadedMore] = useState(false)

    const handleLoadMore = useCallback(() => {
      if (!hasLoadedMore) {
        requestIdleCallback(() => {
          dispatch(fetchProductsByCategory(category))
          setHasLoadedMore(true)
        })
      }
    }, [dispatch, category, hasLoadedMore])

    return (
      <LazySection delay={100} threshold={0.1} fallback={<SectionSkeleton type="grid" />} className="mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">{category}</h2>
          {Object.entries(subcategories).map(([subcategory, products]) => (
            <div key={subcategory} className="mb-8">
              <ProductCarousel
                products={products}
                title={subcategory}
                isLoading={false}
                category={category}
                onLoadMore={handleLoadMore}
              />
            </div>
          ))}
        </div>
      </LazySection>
    )
  },
)

LazyCategorySection.displayName = "LazyCategorySection"

function ProductGrid() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    products: allProducts,
    categorySubcategoryProducts,
    status,
    error,
  } = useSelector((state: RootState) => state.products)

  const isLoading = status === "loading"
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  useEffect(() => {
    // Only fetch initial products if they haven't been loaded yet
    if (status === "idle") {
      // Use requestIdleCallback for non-critical loading
      requestIdleCallback(() => {
        dispatch(fetchProducts({ limit: 30 } as any)).then(() => {
          setInitialLoadComplete(true)
        })
      })
    } else if (status === "succeeded") {
      setInitialLoadComplete(true)
    }
  }, [dispatch, status])

  // Optimized category rendering with memoization
  const renderCategorySubcategoryCarousels = useCallback(() => {
    if (Object.keys(categorySubcategoryProducts).length === 0) {
      if (isLoading || !initialLoadComplete) {
        return (
          <>
            <SectionSkeleton type="grid" className="mb-8" />
            <SectionSkeleton type="grid" className="mb-8" />
            <SectionSkeleton type="grid" className="mb-8" />
          </>
        )
      }

      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available</p>
        </div>
      )
    }

    // Split categories for progressive loading
    const categories = Object.entries(categorySubcategoryProducts)
    const firstCategory = categories[0]
    const remainingCategories = categories.slice(1)

    return (
      <>
        {/* Load first category immediately */}
        {firstCategory && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{firstCategory[0]}</h2>
            {Object.entries(firstCategory[1]).map(([subcategory, products]) => (
              <div key={subcategory} className="mb-8">
                <ProductCarousel
                  products={products}
                  title={subcategory}
                  isLoading={isLoading}
                  category={firstCategory[0]}
                />
              </div>
            ))}
          </div>
        )}

        {/* Lazy load remaining categories */}
        {remainingCategories.map(([category, subcategories]) => (
          <LazyCategorySection key={category} category={category} subcategories={subcategories} />
        ))}
      </>
    )
  }, [categorySubcategoryProducts, isLoading, initialLoadComplete])

  return (
    <div className="w-full px-4 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          {status === "loading" && <span className="ml-2">Retrying...</span>}
        </div>
      )}

      {renderCategorySubcategoryCarousels()}
    </div>
  )
}

export default memo(ProductGrid)
