"use client"

import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Flag, Clock, ChevronDown, Filter, Calculator, X, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id?: string
  product_id: number
  title: string
  image_link?: string
  seller_name: string
  emailId?: string
  status?: string
  commission?: string
  price?: number
  commission_type?: "percentage" | "fixed"
  commission_value?: number
  final_price?: number
  created_at?: string
}

export function ReviewsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [searchProductName, setSearchProductName] = useState("")
  const [searchProductId, setSearchProductId] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [updatingCommission, setUpdatingCommission] = useState<number | null>(null)
  const [updatingCommissionDetails, setUpdatingCommissionDetails] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)
  const { toast } = useToast()

  const productsPerPage = 10
  const placeholderImage = "/placeholder.svg?height=48&width=48"

  useEffect(() => {
    fetchProducts()
  }, [statusFilter, dateFilter])

  useEffect(() => {
    applySearchFilters()
  }, [products, searchProductName, searchProductId, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      // Fetch all products when filters are active, otherwise use pagination
      if (statusFilter || dateFilter) {
        queryParams.append("limit", "10000") // Large number to get all products
      } else {
        queryParams.append("page", currentPage.toString())
        queryParams.append("limit", productsPerPage.toString())
      }

      if (statusFilter) {
        queryParams.append("status", statusFilter)
      }

      if (dateFilter) {
        queryParams.append("date", dateFilter)
      }

      const response = await fetch(`/api/admin/products?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()

      const productsWithStatus = (data.products || []).map((product: any) => ({
        ...product,
        status: product.status || "Pending",
        commission: product.commission || "No",
        price: Number(product.price) || 0,
        commission_type: product.commission_type || "percentage",
        commission_value: Number(product.commission_value) || 0,
        final_price: Number(product.final_price) || Number(product.price) || 0,
        seller_name: product.emailId || product.seller_name || "Unknown Seller",
      }))

      setProducts(productsWithStatus)
      setFilteredProducts(productsWithStatus)
      setTotalPages(Math.ceil((data.total || 0) / productsPerPage))
      setLoading(false)
    } catch (err) {
      setError("Error fetching products. Please try again.")
      setLoading(false)
      console.error("Error fetching products:", err)
    }
  }

  const applySearchFilters = () => {
    let filtered = [...products]

    // Filter by product name
    if (searchProductName.trim()) {
      filtered = filtered.filter((product) => product.title.toLowerCase().includes(searchProductName.toLowerCase()))
    }

    // Filter by product ID
    if (searchProductId.trim()) {
      filtered = filtered.filter((product) => product.product_id.toString().includes(searchProductId))
    }

    // Filter by status is already handled via API, but we reapply for consistency
    if (statusFilter) {
      filtered = filtered.filter((product) => product.status === statusFilter)
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  const calculateFinalPrice = (originalPrice: number, commissionType: string, commissionValue: number) => {
    const price = Number(originalPrice) || 0
    const value = Number(commissionValue) || 0

    if (commissionType === "percentage") {
      return price + (price * value) / 100
    } else {
      return price + value
    }
  }

  const handleStatusChange = async (productId: number, newStatus: string) => {
    try {
      setUpdatingStatus(productId)

      const response = await fetch("/api/admin/products/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_id === productId ? { ...product, status: newStatus } : product)),
      )

      setFilteredProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_id === productId ? { ...product, status: newStatus } : product)),
      )

      toast({
        title: "Status Updated",
        description: `Product ID ${productId} status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update Product ID ${productId} status`,
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleCommissionChange = async (productId: number, newCommission: string) => {
    try {
      setUpdatingCommission(productId)

      const response = await fetch("/api/admin/products/update-commission", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          commission: newCommission,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update commission")
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.product_id === productId) {
            const updatedProduct = { ...product, commission: newCommission }
            if (newCommission === "No") {
              updatedProduct.commission_type = "percentage"
              updatedProduct.commission_value = 0
              updatedProduct.final_price = product.price || 0
            }
            return updatedProduct
          }
          return product
        }),
      )

      setFilteredProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.product_id === productId) {
            const updatedProduct = { ...product, commission: newCommission }
            if (newCommission === "No") {
              updatedProduct.commission_type = "percentage"
              updatedProduct.commission_value = 0
              updatedProduct.final_price = product.price || 0
            }
            return updatedProduct
          }
          return product
        }),
      )

      toast({
        title: "Commission Updated",
        description: `Product ID ${productId} commission changed to ${newCommission}`,
      })
    } catch (error) {
      console.error("Error updating commission:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update Product ID ${productId} commission`,
      })
    } finally {
      setUpdatingCommission(null)
    }
  }

  const handleCommissionDetailsChange = async (productId: number, commissionType: string, commissionValue: number) => {
    try {
      setUpdatingCommissionDetails(productId)

      const product = products.find((p) => p.product_id === productId)
      if (!product) return

      const originalPrice = Number(product.price) || 0
      const finalPrice = calculateFinalPrice(originalPrice, commissionType, commissionValue)

      const response = await fetch("/api/admin/products/update-commission-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          commission_type: commissionType as "percentage" | "fixed",
          commission_value: Number(commissionValue),
          final_price: finalPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update commission details")
      }

      const updateProduct = (product: Product) => {
        if (product.product_id === productId) {
          return {
            ...product,
            commission_type: commissionType as "percentage" | "fixed",
            commission_value: Number(commissionValue),
            final_price: finalPrice,
          }
        }
        return product
      }

      setProducts((prevProducts) => prevProducts.map(updateProduct))
      setFilteredProducts((prevProducts) => prevProducts.map(updateProduct))

      toast({
        title: "Commission Details Updated",
        description: `Product ID ${productId} commission details updated successfully`,
      })
    } catch (error) {
      console.error("Error updating commission details:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update Product ID ${productId} commission details`,
      })
    } finally {
      setUpdatingCommissionDetails(null)
    }
  }

  const resetFilters = () => {
    setStatusFilter(null)
    setDateFilter(null)
    setSearchProductName("")
    setSearchProductId("")
    setCurrentPage(1)
  }

  const getStatusColor = (status: string | undefined) => {
    const statusColors: Record<string, string> = {
      Pending: "bg-orange-100 text-orange-800",
      Approved: "bg-green-100 text-green-800",
      Flagged: "bg-red-100 text-red-800",
    }

    return status && statusColors[status] ? statusColors[status] : statusColors["Pending"]
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "Approved":
        return <Check className="h-4 w-4" />
      case "Flagged":
        return <Flag className="h-4 w-4" />
      case "Pending":
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleImageClick = (imageSrc: string, imageAlt: string) => {
    setSelectedImage({ src: imageSrc, alt: imageAlt })
  }

  const closeImagePopup = () => {
    setSelectedImage(null)
  }

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
  const totalFilteredPages = Math.ceil(filteredProducts.length / productsPerPage)

  const CommissionDetailsCell = ({ product }: { product: Product }) => {
    const [localCommissionType, setLocalCommissionType] = useState(product.commission_type || "percentage")
    const [localCommissionValue, setLocalCommissionValue] = useState(product.commission_value || 0)
    const [isEditing, setIsEditing] = useState(false)

    const isCommissionActive = product.commission === "Yes"
    const isUpdating = updatingCommissionDetails === product.product_id

    const originalPrice = Number(product.price) || 0
    const currentCommissionValue = Number(product.commission_value) || 0
    const currentFinalPrice = Number(product.final_price) || originalPrice

    const previewFinalPrice = calculateFinalPrice(originalPrice, localCommissionType, localCommissionValue)

    const handleSave = () => {
      handleCommissionDetailsChange(product.product_id, localCommissionType, localCommissionValue)
      setIsEditing(false)
    }

    const handleCancel = () => {
      setLocalCommissionType(product.commission_type || "percentage")
      setLocalCommissionValue(product.commission_value || 0)
      setIsEditing(false)
    }

    if (!isCommissionActive) {
      return (
        <div className="text-center text-gray-400 text-sm">
          <span>Commission Disabled</span>
        </div>
      )
    }

    return (
      <div className="space-y-2 min-w-[200px]">
        {isEditing ? (
          <div className="space-y-2">
            <Select
              value={localCommissionType}
              onValueChange={(value) => setLocalCommissionType(value as "percentage" | "fixed")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={localCommissionValue}
              onChange={(e) => setLocalCommissionValue(Number(e.target.value) || 0)}
              placeholder={localCommissionType === "percentage" ? "Enter %" : "Enter ₹"}
              className="w-full"
              min="0"
              step={localCommissionType === "percentage" ? "0.1" : "1"}
            />

            <div className="text-xs text-gray-600 space-y-1">
              <div>Original: ₹{originalPrice.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <Calculator className="h-3 w-3" />
                Preview Final: ₹{previewFinalPrice.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-1">
              <Button size="sm" onClick={handleSave} disabled={isUpdating} className="flex-1">
                {isUpdating ? <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" /> : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {product.commission_type === "percentage" ? "Percentage" : "Fixed Amount"}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-6 px-2">
                Edit
              </Button>
            </div>

            <div className="text-sm font-medium">
              {product.commission_type === "percentage"
                ? `${currentCommissionValue}%`
                : `₹${currentCommissionValue.toLocaleString()}`}
            </div>

            <div className="text-xs text-gray-600">Original: ₹{originalPrice.toLocaleString()}</div>

            <div className="text-sm font-bold text-green-600 flex items-center gap-1">
              <Calculator className="h-3 w-3" />
              Final: ₹{currentFinalPrice.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    )
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalFilteredPages))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
          <h2 className="text-xl font-semibold">Product Table</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            {/* Filter Icon and Label */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Search Product ID */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Product ID"
                  value={searchProductId}
                  onChange={(e) => {
                    setSearchProductId(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-7 pr-3 py-1 h-9 text-sm w-32"
                />
              </div>
            </div>

            {/* Search Product Name */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Product Name"
                  value={searchProductName}
                  onChange={(e) => {
                    setSearchProductName(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-7 pr-3 py-1 h-9 text-sm w-40"
                />
              </div>
            </div>

            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent h-9">
                  {statusFilter || "All Status"} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter(null)
                    setCurrentPage(1)
                  }}
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("Pending")
                    setCurrentPage(1)
                  }}
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("Approved")
                    setCurrentPage(1)
                  }}
                >
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("Flagged")
                    setCurrentPage(1)
                  }}
                >
                  Flagged
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Image</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Product ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Product Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Seller Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">ADD Commission</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Commission Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product._id || product.product_id} className="border-b">
                      <td className="p-4 align-middle">
                        <div
                          className="h-12 w-12 overflow-hidden rounded-md relative cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all duration-200"
                          onClick={() => handleImageClick(product.image_link || placeholderImage, product.title)}
                        >
                          <img
                            src={product.image_link || placeholderImage}
                            alt={product.title}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = placeholderImage
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-4 align-middle">{product.product_id}</td>
                      <td className="p-4 align-middle">
                        <div className="max-w-[200px] truncate" title={product.title}>
                          {product.title}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="max-w-[150px] truncate text-sm text-gray-600">{product.seller_name}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 ${getStatusColor(product.status)}`}
                              disabled={updatingStatus === product.product_id}
                            >
                              <span className="flex items-center gap-1">
                                {getStatusIcon(product.status)}
                                {product.status}
                              </span>
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(product.product_id, "Pending")}>
                              <Clock className="h-4 w-4 mr-2" />
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(product.product_id, "Approved")}>
                              <Check className="h-4 w-4 mr-2" />
                              Approved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(product.product_id, "Flagged")}>
                              <Flag className="h-4 w-4 mr-2" />
                              Flagged
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              disabled={updatingCommission === product.product_id}
                            >
                              {product.commission}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCommissionChange(product.product_id, "Yes")}>
                              Yes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCommissionChange(product.product_id, "No")}>
                              No
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-4 align-middle">
                        <CommissionDetailsCell product={product} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1} to{" "}
            {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalFilteredPages}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeImagePopup}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold">{selectedImage.alt}</h3>
              <Button variant="ghost" size="sm" onClick={closeImagePopup}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <img src={selectedImage.src || "/placeholder.svg"} alt={selectedImage.alt} className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
