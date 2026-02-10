"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import ProductCard from "@/components/layout/product-card"

interface Product {
  product_id: number
  title: string
  description?: string
  category_name: string
  price: number
  final_price?: number // added final_price field
  discount: number
  image_link: string
  rating: number
  seller_name: string
  location: string
  stock: number
  seller_id: number
  gst?: number
  review_count?: number
}

interface Category {
  name: string
  count: number
  sampleImage?: string
  subcategories?: string[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([]) // Store all products for filtering
  const [categories, setCategories] = useState<Category[]>([]) // Store categories
  const [selectedCategory, setSelectedCategory] = useState<string>("All") // Track selected category
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories")
        setCategories(response.data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get("/api/products")

        const productsData = Array.isArray(response.data)
          ? response.data
          : response.data.products
            ? response.data.products
            : []

        if (productsData.length === 0) {
          setError("No products found. Please add some products first.")
        }

        const typedProducts = productsData.map((product: any) => ({
          product_id: product.product_id || 0,
          title: product.title || "Untitled Product",
          description: product.description || "",
          category_name: product.category_name || "Uncategorized",
          price: product.price || 0,
          final_price: product.final_price || 0, // added final_price field
          discount: product.discount || 0,
          image_link: product.image_link || "",
          rating: product.rating || 0,
          seller_name: product.seller_name || "Unknown Seller",
          location: product.location || "Unknown Location",
          stock: product.stock || 0,
          seller_id: product.seller_id || 0,
          gst: product.gst || 0,
          review_count: product.review_count || 0,
        }))

        setAllProducts(typedProducts)
        setProducts(typedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to fetch products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedCategory === "All") {
      setProducts(allProducts)
    } else {
      const filtered = allProducts.filter((product) => product.category_name === selectedCategory)
      setProducts(filtered)
    }
  }, [selectedCategory, allProducts])

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Products</h1>
          <p className="text-lg md:text-xl text-green-50">Discover our complete collection of quality products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange("All")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                selectedCategory === "All"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-green-600 hover:text-green-600"
              }`}
            >
              All Products ({allProducts.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategory === category.name
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-green-600 hover:text-green-600"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {products.length} {products.length === 1 ? "Product" : "Products"} Available
            {selectedCategory !== "All" && <span className="text-green-600"> in {selectedCategory}</span>}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedCategory === "All"
                ? "No products available"
                : `No products found in ${selectedCategory} category`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.product_id}
                title={product.title}
                company={product.seller_name}
                location={product.location}
                price={product.price}
                final_price={product.final_price} // pass final_price prop
                originalPrice={product.price / (1 - product.discount / 100)}
                discount={product.discount}
                gst={product.gst}
                image_link={product.image_link || "/placeholder.svg?height=200&width=200"}
                hoverImage={product.image_link || "/placeholder.svg?height=200&width=200"}
                href={`/products/${product.product_id}`}
                rating={product.rating}
                reviewCount={product.review_count}
                seller_id={product.seller_id}
                stock={product.stock}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
