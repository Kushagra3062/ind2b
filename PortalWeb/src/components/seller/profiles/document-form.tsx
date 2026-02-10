"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./file-upload"
import { toast } from "sonner"
import { Edit, Loader2, AlertTriangle } from "lucide-react"

interface DocumentFormProps {
  initialData?: {
    panCardUrl?: string | null
    aadharCardUrl?: string | null
  }
  onSuccess?: () => void
}

export function DocumentForm({ initialData, onSuccess }: DocumentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Simplified condition: Just check if initialData exists
  const [isEditing, setIsEditing] = useState(!initialData)

  const [formData, setFormData] = useState({
    panCard: initialData?.panCardUrl || "",
    aadharCard: initialData?.aadharCardUrl || "",
  })

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        panCard: initialData.panCardUrl || "",
        aadharCard: initialData.aadharCardUrl || "",
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData()

      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value || "")
      })

      // Import the server action dynamically to avoid source map issues
      const { saveDocuments } = await import("@/actions/profile")
      const response = await saveDocuments(formDataObj)

      if (response.success) {
        toast.success("Documents saved successfully")
        setIsEditing(false) // Set to view mode after successful save

        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(response.message || "Failed to save documents")
      }
    } catch (error) {
      console.error("Error completing profile:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Upload the required documents for your seller profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                PAN Card <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <FileUpload
                value={formData.panCard}
                onChange={(value) => setFormData({ ...formData, panCard: value || "" })}
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize={5}
                label="Upload PAN Card"
                disabled={!isEditing}
              />
              <p className="text-xs text-gray-500 mt-1">Upload a clear scan or photo of your PAN Card</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Aadhar Card <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <FileUpload
                value={formData.aadharCard}
                onChange={(value) => setFormData({ ...formData, aadharCard: value || "" })}
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize={5}
                label="Upload Aadhar Card"
                disabled={!isEditing}
              />
              <p className="text-xs text-gray-500 mt-1">Upload a clear scan or photo of your Aadhar Card</p>
            </div>

          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          {isEditing && (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md w-full mb-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-bold">⚠️ Review your profile carefully!</span> After final submission, you cannot
                edit your data without permission.
              </p>
            </div>
          )}

          {!isEditing && initialData && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}

          {isEditing && (
            <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
