"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "@uploadthing/react"
import { generateClientDropzoneAccept } from "uploadthing/client"
import { X, FileText, Loader2 } from "lucide-react"
import Image from "next/image"

interface FileUploadProps {
  endpoint?: "profileImage" | "documentImage"
  onChange: (url?: string) => void
  value?: string | null | undefined
  onRemove?: () => void
  accept?: string
  maxSize?: number
  label?: string
  disabled?: boolean // Added disabled prop
}

export const FileUpload = ({
  endpoint = "profileImage",
  onChange,
  value,
  onRemove,
  accept,
  maxSize,
  label,
  disabled = false, // Added with default value
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsUploading(true)
      const file = acceptedFiles[0]

      if (file) {
        // Create a local preview immediately for better UX
        const localPreview = URL.createObjectURL(file)
        setPreviewUrl(localPreview)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("uploadPreset", "profileImage")

        fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            onChange(data.secure_url)
            // Keep the preview URL
          })
          .catch((error) => {
            console.error("Upload error:", error)
            // Revert to previous state on error
            setPreviewUrl(value || null)
          })
          .finally(() => setIsUploading(false))
      }
    },
    [onChange, value],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : generateClientDropzoneAccept([endpoint]),
    multiple: false,
    maxSize: maxSize ? maxSize * 1024 * 1024 : undefined,
    disabled: isUploading || disabled, // Updated to include the disabled prop
  })

  const handleRemove = () => {
    setPreviewUrl(null)
    onChange("")
    if (onRemove) onRemove()
  }

  // Determine if we have a valid file to preview
  const hasValidFile = !!previewUrl || (typeof value === "string" && value.length > 0)
  const displayUrl = previewUrl || value || ""

  // Check if it's an image file
  const isImageFile = displayUrl.match(/\.(jpeg|jpg|gif|png)$/i) !== null

  return (
    <div className="w-full">
      {isUploading && (
        <div className="flex items-center justify-center p-4 border rounded-md mb-2 bg-gray-50">
          <Loader2 className="h-6 w-6 text-orange-500 animate-spin mr-2" />
          <p className="text-sm text-gray-600">Uploading file...</p>
        </div>
      )}

      {hasValidFile && !isUploading && (
        <div className="flex items-center justify-between p-4 border rounded-md mb-2 bg-gray-50">
          <div className="flex items-center space-x-3">
            {isImageFile ? (
              <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image
                  fill
                  src={displayUrl || "/placeholder.svg"}
                  alt="Uploaded file"
                  className="object-cover"
                  onError={() => {
                    // Fallback if image fails to load
                    console.log("Image failed to load")
                  }}
                />
              </div>
            ) : (
              <FileText className="h-10 w-10 text-blue-500" />
            )}
            <div>
              <p className="text-sm font-medium">File uploaded successfully</p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {displayUrl.split("/").pop() || "Uploaded file"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            type="button"
            disabled={disabled} // Added disabled state to the remove button
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {(!hasValidFile || isUploading) && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-70"
              : "hover:border-orange-500 transition-colors cursor-pointer"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <div className="flex justify-center">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              {isDragActive ? "Drop the file here" : label || "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              {accept ? `Accepted formats: ${accept.replace(/\./g, "")}` : "All file types accepted"}
              {maxSize && ` (Max size: ${maxSize}MB)`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
