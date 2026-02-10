"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProductForm from "./product-form"
import { fetchSellerEmail } from "@/lib/seller-utils"

// Define the product interface based on the entity structure
interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  image_link?: string
  stock: number
  price: number
  discount?: number
  SKU: string
  seller_id?: string
  emailId: string
  created_at?: string
  rating?: number
  updated_at?: string
  seller_name: string
  location: string
  category_name: string
  sub_category_name?: string
  is_draft?: boolean
  isActive?: boolean
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sellerEmail, setSellerEmail] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch seller email first
  const getSellerEmail = useCallback(async () => {
    try {
      const email = await fetchSellerEmail()
      if (email) {
        setSellerEmail(email)
        return email
      } else {
        setProfileError("Your profile is incomplete. Please complete your contact details first.")
        return null
      }
    } catch (error) {
      console.error("Error fetching seller email:", error)
      setProfileError("Failed to retrieve your profile information. Please complete your profile first.")
      return null
    }
  }, [])

  // Fetch products function
  const fetchProducts = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log("Fetching products from API...")
      const response = await fetch("/api/seller/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data
      })

      console.log("API Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch products`)
      }

      const data = await response.json()
      console.log("Fetched products data:", data)

      if (data && Array.isArray(data.products)) {
        console.log(`Successfully loaded ${data.products.length} products`)
        setProducts(data.products)

        if (data.products.length === 0) {
          console.log("No products found for this seller")
        }
      } else if (Array.isArray(data)) {
        console.log(`Successfully loaded ${data.length} products (direct array)`)
        setProducts(data)
      } else {
        console.error("Unexpected response format:", data)
        setProducts([])
        throw new Error("Invalid response format from server")
      }
    } catch (err: any) {
      console.error("Error fetching products:", err)
      setError(err.message || "Failed to load products. Please try again.")
      setProducts([]) // Clear products on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Fetch products on component mount
  useEffect(() => {
    const fetchData = async () => {
      const email = await getSellerEmail()
      if (email) {
        await fetchProducts()
      } else {
        setLoading(false)
      }
    }

    fetchData()
  }, [getSellerEmail, fetchProducts])

  const handleSubmitProduct = async (formData: any, isDraft: boolean) => {
    try {
      const method = editingProduct ? "PUT" : "POST"
      const endpoint = editingProduct ? `/api/seller/products?id=${editingProduct.product_id}` : "/api/seller/products"

      const payload = {
        ...formData,
        is_draft: isDraft,
      }

      if (editingProduct) {
        payload.product_id = editingProduct.product_id
      }

      console.log("Submitting product data:", payload)

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save product")
      }

      const savedProduct = await response.json()
      console.log("Saved product:", savedProduct)

      // Close the form
      setShowAddForm(false)
      setEditingProduct(null)

      // Show success message
      toast({
        title: isDraft ? "Draft saved" : "Product saved",
        description: isDraft ? "Your product draft has been saved." : "Your product has been published successfully.",
      })

      // Refresh the product list
      await fetchProducts()
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save product. Please try again.",
        
      })
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetch(`/api/seller/products?id=${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete product")
      }

      // Remove the product from the local state
      setProducts(products.filter((product) => product.product_id !== productId))

      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })
    } catch (err: any) {
      console.error("Error deleting product:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete product. Please try again.",
        
      })
    }
  }

  const handleUpdateProductStatus = async (productId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/seller/products?id=${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update product status")
      }

      // Update the local state
      setProducts(products.map((product) => (product.product_id === productId ? { ...product, isActive } : product)))

      toast({
        title: "Status updated",
        description: isActive
          ? "Product is now visible on the landing page"
          : "Product is now hidden from the landing page",
      })
    } catch (err: any) {
      console.error("Error updating product status:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update product status. Please try again.",
       
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const handleRefresh = () => {
    fetchProducts(true)
  }

  // Reset category filter
  const resetCategoryFilter = () => {
    setSelectedCategory("All")
    setCurrentPage(1)
  }

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((product) => product.category_name === selectedCategory)

  // Pagination
  const productsPerPage = 10
  const totalProducts = filteredProducts.length
  const totalPages = Math.ceil(totalProducts / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Get unique categories for filter
  const categories = ["All", ...new Set(products.map((product) => product.category_name))]

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

  if (profileError) {
    return (
      <div className="w-full p-4 sm:p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Not Complete</AlertTitle>
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/seller/profile")} className="mt-4">
          Complete Profile
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full p-4 sm:p-6">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div>Loading your products...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-4 sm:p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Products</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchProducts()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </Button>
          <Button onClick={() => router.push("/seller/profile")} variant="outline">
            Check Profile
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4 sm:p-6">
      {showAddForm ? (
        <ProductForm
          onSubmit={handleSubmitProduct}
          onCancel={() => {
            setShowAddForm(false)
            setEditingProduct(null)
          }}
          initialData={editingProduct || undefined}
          productId={editingProduct?.product_id}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Product Stock ({products.length} products)</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full sm:w-64">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1) // Reset to first page when changing category
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "All" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="w-full sm:w-auto bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="bg-black hover:bg-black/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Display active category filter if not "All" */}
          {selectedCategory !== "All" && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtering by category:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                {selectedCategory}
              </span>
              <button onClick={resetCategoryFilter} className="text-xs text-blue-600 hover:text-blue-800">
                Clear filter
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Product Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Product Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Price (₹)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {products.length === 0 ? (
                        <div>
                          <div className="text-lg mb-2">No products found</div>
                          <div className="text-sm">
                            {sellerEmail
                              ? "You haven't added any products yet. Click 'Add Product' to get started!"
                              : "Please complete your profile to start adding products."}
                          </div>
                        </div>
                      ) : (
                        "No products found in this category."
                      )}
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr key={product.product_id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="h-16 w-16 relative">
                          <Image
                            src={product.image_link || "/placeholder.svg?height=80&width=80"}
                            alt={product.title}
                            fill
                            className="object-contain rounded-md"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">{product.category_name}</td>
                      <td className="px-4 py-3">
                        <div>
                          {product.title}
                          {product.is_draft && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {product.product_id} | SKU: {product.SKU}
                        </div>
                      </td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">₹{product.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.isActive || false}
                            onCheckedChange={(checked) => handleUpdateProductStatus(product.product_id, checked)}
                            className="data-[state=checked]:bg-black"
                          />
                          <span className="text-xs text-gray-500">{product.isActive ? "Visible" : "Hidden"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteProduct(product.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalProducts > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 text-sm gap-4">
              <div>
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, totalProducts)} of {totalProducts}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span>
                  {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <Toaster />
    </div>
  )
}
