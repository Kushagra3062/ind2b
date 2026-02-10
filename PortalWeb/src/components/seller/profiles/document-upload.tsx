"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  value: string
  onChange: (value: string) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
  disabled?: boolean
}

export function DocumentUpload({
  value,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5,
  label = "Upload Document",
  disabled = false,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024)
    if (fileSizeInMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setError(null)
    setIsUploading(true)

    // In a real app, you would upload the file to a storage service
    // and then set the URL as the value
    // For now, we'll simulate a delay and use a placeholder URL
    setTimeout(() => {
      // This would be the URL returned from your upload service
      const fileUrl = URL.createObjectURL(file)
      onChange(fileUrl)
      setIsUploading(false)
    }, 1000)
  }

  const handleRemove = () => {
    onChange("")
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const uniqueId = `document-upload-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div className="space-y-2">
      {!value ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-4 text-center hover:border-gray-400 transition-colors",
            error ? "border-red-500" : "border-gray-300",
          )}
        >
          <input
            id={uniqueId}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
            ref={inputRef}
          />
          <label
            htmlFor={uniqueId}
            className={cn(
              "flex flex-col items-center justify-center cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-gray-400" />
            )}
            <span className="mt-2 text-sm font-medium text-gray-700">{isUploading ? "Uploading..." : label}</span>
            <span className="mt-1 text-xs text-gray-500">Max size: {maxSize}MB</span>
          </label>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {typeof value === "string" && value.includes("/") ? value.split("/").pop() : "Document uploaded"}
            </span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={disabled}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
