"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "all"
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

interface AdvertisementTableProps {
  advertisements: Advertisement[]
  loading: boolean
  pagination: PaginationData
  onEdit: (ad: Advertisement) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, currentStatus: boolean) => void
  onPageChange: (page: number) => void
}

export function AdvertisementTable({
  advertisements = [],
  loading,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
}: AdvertisementTableProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (adId: string) => {
    console.log(`Image failed to load for ad: ${adId}`)
    setImageErrors((prev) => ({ ...prev, [adId]: true }))
  }

  const getDeviceTypeColor = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return "bg-blue-100 text-blue-800"
      case "mobile":
        return "bg-green-100 text-green-800"
      case "tablet":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "homepage":
        return "bg-blue-100 text-blue-800"
      case "category":
        return "bg-purple-100 text-purple-800"
      case "bottomofhomepage":
        return "bg-orange-100 text-orange-800"
      case "cart":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get image source - prioritize imageData (base64) over imageUrl
  const getImageSource = (ad: Advertisement) => {
    if (ad.imageData) return ad.imageData
    if (ad.imageUrl) return ad.imageUrl
    return "/placeholder.svg"
  }

  const renderImage = (ad: Advertisement) => {
    const imageSource = getImageSource(ad)
    const hasError = imageErrors[ad._id]

    if (!imageSource || hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">No Image</div>
      )
    }

    // Use regular img tag for external URLs to avoid Next.js configuration issues
    if (imageSource.startsWith("http") && !imageSource.startsWith(window.location.origin)) {
      return (
        <img
          src={imageSource || "/placeholder.svg"}
          alt={ad.title}
          className="w-full h-full object-cover"
          onError={() => handleImageError(ad._id)}
        />
      )
    }

    // Use Next.js Image for internal URLs and base64 data
    return (
      <Image
        src={imageSource || "/placeholder.svg"}
        alt={ad.title}
        fill
        className="object-cover"
        onError={() => handleImageError(ad._id)}
        unoptimized={imageSource.startsWith("data:")}
      />
    )
  }

  // Ensure advertisements is always an array
  const safeAdvertisements = Array.isArray(advertisements) ? advertisements : []

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advertisements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advertisements</CardTitle>
      </CardHeader>
      <CardContent>
        {safeAdvertisements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No advertisements found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Image</th>
                    <th className="text-left py-3 px-2">Title</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Position</th>
                    <th className="text-left py-3 px-2">Device</th>
                    <th className="text-left py-3 px-2">Order</th>
                    <th className="text-left py-3 px-2">Schedule</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeAdvertisements.map((ad) => (
                    <tr key={ad._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="w-16 h-10 relative rounded overflow-hidden bg-gray-100">{renderImage(ad)}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-sm">{ad.title}</div>
                          <div className="text-xs text-gray-500">{ad.subtitle}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={ad.isActive ? "default" : "secondary"}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getPositionColor(ad.position)}>{ad.position}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getDeviceTypeColor(ad.deviceType)}>{ad.deviceType}</Badge>
                      </td>
                      <td className="py-3 px-2 text-sm">{ad.order}</td>
                      <td className="py-3 px-2 text-xs text-gray-500">
                        {ad.startDate && <div>Start: {formatDate(ad.startDate)}</div>}
                        {ad.endDate && <div>End: {formatDate(ad.endDate)}</div>}
                        {!ad.startDate && !ad.endDate && "Always"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => onToggleStatus(ad._id, ad.isActive)}>
                            {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onEdit(ad)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(ad._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {ad.linkUrl && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(ad.linkUrl, "_blank")}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {safeAdvertisements.map((ad) => (
                <Card key={ad._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        {renderImage(ad)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-sm truncate">{ad.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{ad.subtitle}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button variant="ghost" size="sm" onClick={() => onToggleStatus(ad._id, ad.isActive)}>
                              {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(ad)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(ad._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={ad.isActive ? "default" : "secondary"} className="text-xs">
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge className={`text-xs ${getPositionColor(ad.position)}`}>{ad.position}</Badge>
                          <Badge className={`text-xs ${getDeviceTypeColor(ad.deviceType)}`}>{ad.deviceType}</Badge>
                          <span className="text-xs text-gray-500">Order: {ad.order}</span>
                        </div>
                        {(ad.startDate || ad.endDate) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {ad.startDate && `Start: ${formatDate(ad.startDate)}`}
                            {ad.startDate && ad.endDate && " | "}
                            {ad.endDate && `End: ${formatDate(ad.endDate)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
