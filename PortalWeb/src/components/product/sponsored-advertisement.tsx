"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

interface SponsoredAdvertisementProps {
  imageUrl?: string
  linkUrl?: string
  altText?: string
  title?: string
}

export default function SponsoredAdvertisement({
  imageUrl = "/image.webp", // Updated default to use image.webp
  linkUrl = "https://example.com/sponsored-link",
  altText = "Sponsored Advertisement",
  title = "Sponsored",
}: SponsoredAdvertisementProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [imageError, setImageError] = useState(false) // Added image error state

  if (!isVisible) {
    return null
  }

  const handleImageClick = () => {
    window.open(linkUrl, "_blank", "noopener,noreferrer")
  }

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsVisible(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white border rounded-lg p-4 relative">
      {/* Cross button in top right corner */}
      <button
        onClick={handleCloseClick}
        className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        aria-label="Close advertisement"
      >
        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Sponsored label */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
          {title}
        </span>
      </div>

      {/* Square advertisement image */}
      <div
        className="relative aspect-square w-full cursor-pointer group overflow-hidden rounded-lg"
        onClick={handleImageClick}
      >
        {!imageError ? (
          <Image
            src={imageUrl || "/sell.png"} // Fallback to sell.png if imageUrl is empty
            alt={altText}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Advertisement Image</p>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Optional advertisement text */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">Click to learn more</p>
      </div>
    </div>
  )
}
