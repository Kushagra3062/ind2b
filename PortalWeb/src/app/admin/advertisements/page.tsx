"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AdvertisementModal } from "@/components/admin/advertisements/advertisement-modal"
import { AdvertisementTable } from "@/components/admin/advertisements/advertisement-table"

interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string // Make this optional
  imageData?: string // Add this property
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all"
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [filters, setFilters] = useState({
    isActive: "",
    deviceType: "all",
    position: "all",
  })

  const fetchAdvertisements = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.deviceType !== "all" && { deviceType: filters.deviceType }),
        ...(filters.position !== "all" && { position: filters.position }),
      })

      const response = await fetch(`/api/admin/advertisements?${params}`)
      const result = await response.json()

      if (result.success) {
        setAdvertisements(result.data.advertisements)
        setPagination(result.data.pagination)
      } else {
        toast.error("Failed to fetch advertisements")
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error)
      toast.error("Error fetching advertisements")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Use a small timeout to avoid hydration issues
    const timer = setTimeout(() => {
      fetchAdvertisements()
    }, 0)

    return () => clearTimeout(timer)
  }, [filters])

  const handleCreate = () => {
    setEditingAd(null)
    setIsModalOpen(true)
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Advertisement deleted successfully")
        fetchAdvertisements(pagination.page)
      } else {
        toast.error(result.error || "Failed to delete advertisement")
      }
    } catch (error) {
      console.error("Error deleting advertisement:", error)
      toast.error("Error deleting advertisement")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const advertisement = advertisements.find((ad) => ad._id === id)
      if (!advertisement) return

      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...advertisement,
          isActive: !currentStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Advertisement ${!currentStatus ? "activated" : "deactivated"} successfully`)
        fetchAdvertisements(pagination.page)
      } else {
        toast.error(result.error || "Failed to update advertisement status")
      }
    } catch (error) {
      console.error("Error updating advertisement status:", error)
      toast.error("Error updating advertisement status")
    }
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    setEditingAd(null)
    fetchAdvertisements(pagination.page)
  }

  const activeCount = advertisements?.filter((ad) => ad.isActive)?.length || 0
  const homepageCount =
    advertisements?.filter((ad) => ad.isActive && (ad.position === "homepage" || ad.position === "all"))?.length || 0
  const categoryCount =
    advertisements?.filter((ad) => ad.isActive && (ad.position === "category" || ad.position === "all"))?.length || 0
  const bottomOfHomepageCount =
    advertisements?.filter((ad) => ad.isActive && (ad.position === "bottomofhomepage" || ad.position === "all"))
      ?.length || 0
  const cartCount =
    advertisements?.filter((ad) => ad.isActive && (ad.position === "cart" || ad.position === "all"))?.length || 0
  const wishlistCount =
    advertisements?.filter((ad) => ad.isActive && (ad.position === "wishlist" || ad.position === "all"))?.length || 0

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Advertisement Management</h1>
          <p className="text-gray-600 mt-1">Manage position-specific advertisements ({activeCount} total active)</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Advertisement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Homepage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{homepageCount}</div>
            <p className="text-xs text-gray-500">Slider ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{categoryCount}</div>
            <p className="text-xs text-gray-500">Section ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bottom of Homepage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{bottomOfHomepageCount}</div>
            <p className="text-xs text-gray-500">Bottom homepage ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cartCount}</div>
            <p className="text-xs text-gray-500">Cart page ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{wishlistCount}</div>
            <p className="text-xs text-gray-500">Wishlist page ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{(pagination?.total || 0) - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Position</label>
              <select
                value={filters.position}
                onChange={(e) => setFilters((prev) => ({ ...prev, position: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Positions</option>
                <option value="homepage">Homepage Slider</option>
                <option value="category">Category Section</option>
                <option value="bottomofhomepage">Bottom of Homepage</option>
                <option value="cart">Cart Page</option>
                <option value="wishlist">Wishlist Page</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Device Type</label>
              <select
                value={filters.deviceType}
                onChange={(e) => setFilters((prev) => ({ ...prev, deviceType: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertisements Table */}
      <AdvertisementTable
        advertisements={advertisements}
        loading={loading}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onPageChange={fetchAdvertisements}
      />

      {/* Advertisement Modal */}
      <AdvertisementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        advertisement={editingAd}
      />
    </div>
  )
}
