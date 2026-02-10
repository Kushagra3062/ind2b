"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, X, Video, ImageIcon, Save } from "lucide-react"
import Image from "next/image"

interface PromotionSettings {
  _id?: string
  videoId: string
  bannerImageUrl?: string
  bannerImageData?: string
  isActive: boolean
  updatedAt: string
}

export default function PromotionSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    videoId: "",
    bannerImageUrl: "",
    bannerImageData: "",
  })
  const [imagePreview, setImagePreview] = useState("")
  const [existingSettings, setExistingSettings] = useState<PromotionSettings | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch("/api/admin/promotion-settings")
      const result = await response.json()

      if (result.success && result.data) {
        setExistingSettings(result.data)
        setFormData({
          videoId: result.data.videoId || "",
          bannerImageUrl: result.data.bannerImageUrl || "",
          bannerImageData: result.data.bannerImageData || "",
        })
        setImagePreview(result.data.bannerImageData || result.data.bannerImageUrl || "")
      }
    } catch (error) {
      console.error("Error fetching promotion settings:", error)
    } finally {
      setFetchLoading(false)
    }
  }

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
      console.log("[v0] Image converted to base64")

      // Update form data with base64 image
      setFormData((prev) => ({ ...prev, bannerImageData: base64Data, bannerImageUrl: "" }))
      setImagePreview(base64Data)

      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeVideoId = (input: string): string => {
    // If it's already just an ID, return it
    if (!input.includes("/") && !input.includes("?")) {
      return input
    }

    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/,
      /youtube\.com\/shorts\/([^&?/\s]+)/,
    ]

    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return input
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.videoId) {
      toast.error("Please provide a YouTube video ID or URL")
      return
    }

    if (!formData.bannerImageData && !formData.bannerImageUrl) {
      toast.error("Please provide a banner image")
      return
    }

    try {
      setLoading(true)

      // Extract video ID from URL if needed
      const cleanVideoId = extractYouTubeVideoId(formData.videoId)

      const method = existingSettings ? "PUT" : "POST"
      const response = await fetch("/api/admin/promotion-settings", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: cleanVideoId,
          bannerImageUrl: formData.bannerImageUrl,
          bannerImageData: formData.bannerImageData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        fetchSettings()
      } else {
        toast.error(result.error || "Failed to save promotion settings")
      }
    } catch (error) {
      console.error("Error saving promotion settings:", error)
      toast.error("Error saving promotion settings")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading promotion settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Promotion Settings</h1>
          <p className="text-gray-600 mt-1">Manage the promotion section video and banner image</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promotion Section Configuration</CardTitle>
          <CardDescription>
            Update the YouTube video and banner image displayed in the promotion section. Only one video and one image
            can be active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* YouTube Video ID */}
            <div className="space-y-2">
              <Label htmlFor="videoId" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                YouTube Video ID or URL *
              </Label>
              <Input
                id="videoId"
                value={formData.videoId}
                onChange={(e) => setFormData((prev) => ({ ...prev, videoId: e.target.value }))}
                placeholder="e.g., wG6yqAFZk04 or https://www.youtube.com/watch?v=wG6yqAFZk04"
                required
              />
              <p className="text-sm text-gray-500">
                Enter the YouTube video ID or paste the full YouTube URL. The video will be displayed in the promotion
                section.
              </p>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Banner Image *
              </Label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    {imagePreview.startsWith("data:") ||
                    imagePreview.startsWith("blob:") ||
                    imagePreview.startsWith("/") ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Banner Preview"
                        width={600}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                        unoptimized
                      />
                    ) : (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Banner Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview("")
                        setFormData((prev) => ({ ...prev, bannerImageUrl: "", bannerImageData: "" }))
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
                  </div>
                )}
              </div>

              <div className="mt-2">
                <Label htmlFor="bannerImageUrl">Or enter image URL</Label>
                <Input
                  id="bannerImageUrl"
                  value={formData.bannerImageUrl}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, bannerImageUrl: e.target.value, bannerImageData: "" }))
                    setImagePreview(e.target.value)
                  }}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>

            {/* Current Settings Info */}
            {existingSettings && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Current Settings</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Video ID:</strong> {existingSettings.videoId}
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {new Date(existingSettings.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : existingSettings ? "Update Settings" : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {imagePreview && formData.videoId && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>This is how your promotion section will look on the website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  {imagePreview.startsWith("data:") ||
                  imagePreview.startsWith("blob:") ||
                  imagePreview.startsWith("/") ? (
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-gray-600 text-center">
                    Video ID: <strong>{extractYouTubeVideoId(formData.videoId)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
