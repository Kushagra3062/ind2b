"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Upload, X, Info } from "lucide-react"
import Image from "next/image"

interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string // Make this optional to match the page component
  imageData?: string // Base64 encoded image data
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

interface AdvertisementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  advertisement?: Advertisement | null
}

export function AdvertisementModal({ isOpen, onClose, onSuccess, advertisement }: AdvertisementModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    imageData: "", // Base64 encoded image data
    linkUrl: "",
    isActive: true,
    order: 0,
    deviceType: "all" as "all" | "desktop" | "mobile" | "tablet",
    position: "all" as "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all",
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        subtitle: advertisement.subtitle,
        description: advertisement.description || "",
        imageUrl: advertisement.imageUrl || "",
        imageData: advertisement.imageData || "",
        linkUrl: advertisement.linkUrl || "",
        isActive: advertisement.isActive,
        // Set order to 0 for single advertisement positions (not used)
        order: advertisement.order,
        deviceType: advertisement.deviceType,
        position: advertisement.position,
        startDate: advertisement.startDate ? advertisement.startDate.split("T")[0] : "",
        endDate: advertisement.endDate ? advertisement.endDate.split("T")[0] : "",
      })
      // Set preview from either imageData (base64) or imageUrl
      setImagePreview(advertisement.imageData || advertisement.imageUrl || "")
    } else {
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        imageUrl: "",
        imageData: "",
        linkUrl: "",
        isActive: true,
        order: 0,
        deviceType: "all",
        position: "all",
        startDate: "",
        endDate: "",
      })
      setImagePreview("")
    }
  }, [advertisement])

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true)

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }

      // Convert image to base64
      const base64Data = await convertFileToBase64(file)
      console.log("Image converted to base64")

      // Update form data with base64 image
      setFormData((prev) => ({ ...prev, imageData: base64Data, imageUrl: "" }))
      setImagePreview(base64Data)

      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.subtitle || (!formData.imageData && !formData.imageUrl)) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      console.log("[v0] Submitting advertisement with data:", {
        ...formData,
        imageData: formData.imageData ? "base64 data present" : "no base64 data",
      })

      const url = advertisement ? `/api/admin/advertisements/${advertisement._id}` : "/api/admin/advertisements"

      const method = advertisement ? "PUT" : "POST"

      const requestBody = advertisement
        ? formData // For PUT requests, send form data directly
        : formData // For POST requests, also send form data directly

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      console.log("[v0] Advertisement API response:", result)

      if (result.success) {
        toast.success(result.message)
        onSuccess()
      } else {
        toast.error(result.error || "Failed to save advertisement")
      }
    } catch (error) {
      console.error("Error saving advertisement:", error)
      toast.error("Error saving advertisement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{advertisement ? "Edit Advertisement" : "Create Advertisement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-2">
              Advertisement Image *<span className="text-red-500">★</span>
            </Label>

            {/* Recommended Size Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">★ Recommended Image Sizes:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      <strong>Desktop:</strong> 1200×400px (3:1 ratio) - Best quality
                    </li>
                    <li>
                      <strong>Tablet:</strong> 1024×400px - Good for tablets
                    </li>
                    <li>
                      <strong>Mobile:</strong> 768×300px - Mobile optimized
                    </li>
                  </ul>
                  <p className="mt-2 text-xs">
                    <strong>Tips:</strong> Images will auto-adjust for all devices. Keep important content on the right
                    side (text appears on left).
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  {imagePreview.startsWith("data:") ||
                  imagePreview.startsWith("blob:") ||
                  imagePreview.startsWith("/") ? (
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      width={400}
                      height={133}
                      className="w-full h-32 object-cover rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("")
                      setFormData((prev) => ({ ...prev, imageUrl: "", imageData: "" }))
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Image dimensions info */}
                  <div className="mt-2 text-xs text-gray-500">
                    Preview: Image will automatically adjust for all devices (Desktop, Tablet, Mobile)
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload an image</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  <p className="text-xs text-gray-400 mt-1">★ Best: 1200×400px for optimal quality</p>
                </div>
              )}
            </div>
            <div className="mt-2">
              <Label htmlFor="imageUrl">Or enter image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value, imageData: "" }))
                  setImagePreview(e.target.value)
                }}
                placeholder="https://example.com/image.jpg (★ Recommended: 1200×400px)"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., New Arrivals"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle *</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="e.g., SHOP NOW"
                maxLength={150}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Fresh Stock Available"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
              placeholder="https://example.com/products"
              type="url"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Advertisement Position</Label>
              <select
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    position: e.target.value as
                      | "homepage"
                      | "category"
                      | "bottomofhomepage"
                      | "cart"
                      | "wishlist"
                      | "all",
                  }))
                }
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all" className="text-gray-900">
                  All Pages
                </option>
                <option value="homepage" className="text-gray-900">
                  Homepage Slider
                </option>
                <option value="category" className="text-gray-900">
                  Category Section
                </option>
                <option value="bottomofhomepage" className="text-gray-900">
                  Bottom of Homepage
                </option>
                <option value="cart" className="text-gray-900">
                  Cart Page
                </option>
                <option value="wishlist" className="text-gray-900">
                  Wishlist Page
                </option>
              </select>
              <p className="text-xs text-gray-500">Choose where this advertisement will be displayed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <select
                id="deviceType"
                value={formData.deviceType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deviceType: e.target.value as "all" | "desktop" | "mobile" | "tablet",
                  }))
                }
                className="w-full p-2 border rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all" className="text-gray-900">
                  All Devices
                </option>
                <option value="desktop" className="text-gray-900">
                  Desktop Only
                </option>
                <option value="tablet" className="text-gray-900">
                  Tablet Only
                </option>
                <option value="mobile" className="text-gray-900">
                  Mobile Only
                </option>
              </select>
              <p className="text-xs text-gray-500">"All Devices" automatically optimizes for each screen size</p>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: Number.parseInt(e.target.value) || 0 }))}
                min={0}
                max={100}
              />
              <p className="text-xs text-gray-500">Lower numbers appear first within the same position</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <span className="text-sm">{formData.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : advertisement ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
