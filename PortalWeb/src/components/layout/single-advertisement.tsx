"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

interface SingleAdvertisementProps {
  position?: "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all"
  className?: string
  deviceType?: "desktop" | "mobile" | "tablet" | "all"
}

export default function SingleAdvertisement({
  position = "homepage",
  className = "",
  deviceType,
}: SingleAdvertisementProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [currentDeviceType, setCurrentDeviceType] = useState<string>("desktop")
  const [isClosed, setIsClosed] = useState(false)

  const { advertisements, status } = useSelector((state: RootState) => state.advertisements)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const closedKey = `ad-closed-${position}`
      const wasClosed = sessionStorage.getItem(closedKey) === "true"
      setIsClosed(wasClosed)
    }
  }, [position])

  // Determine device type
  useEffect(() => {
    if (deviceType) {
      setCurrentDeviceType(deviceType)
    } else if (typeof window !== "undefined") {
      const width = window.innerWidth
      if (width < 768) setCurrentDeviceType("mobile")
      else if (width < 1024) setCurrentDeviceType("tablet")
      else setCurrentDeviceType("desktop")
    }
  }, [deviceType])

  const filteredAds = advertisements.filter(
    (ad) =>
      ad.isActive &&
      (ad.deviceType === currentDeviceType || ad.deviceType === "all") &&
      (ad.position === position || ad.position === "all"),
  )

  const handleImageError = useCallback((adId: string) => {
    setImageErrors((prev) => ({ ...prev, [adId]: true }))
  }, [])

  useEffect(() => {
    if (filteredAds.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % filteredAds.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [filteredAds.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const handleClose = useCallback(() => {
    setIsClosed(true)
    if (typeof window !== "undefined") {
      const closedKey = `ad-closed-${position}`
      sessionStorage.setItem(closedKey, "true")
    }
  }, [position])

  // Don't render if advertisement is closed or no ads or not loaded
  if (isClosed || filteredAds.length === 0 || status !== "succeeded") {
    return null
  }

  // Get image source with fallback
  const getImageSource = (ad: any) => {
    if (ad.imageData) return ad.imageData
    if (ad.imageUrl) return ad.imageUrl
    return "/placeholder.svg?height=400&width=1200"
  }

  const shouldUseFullWidth = position === "bottomofhomepage" || position === "cart"
  const shouldShowCloseButton = position === "bottomofhomepage" || position === "cart" || position === "wishlist"

  const heightClass = position === "wishlist" ? "h-[150px] sm:h-[180px] md:h-[200px]" : "h-[300px] sm:h-[400px]"

  return (
    <div className={`${shouldUseFullWidth ? "w-full" : "w-full"} ${className}`}>
      <div
        className={`${shouldUseFullWidth ? "relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" : "relative w-full"}`}
      >
        <div
          className={`relative w-full ${heightClass} overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg`}
        >
          {shouldShowCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-30 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-300 backdrop-blur-sm flex items-center justify-center group"
              aria-label="Close advertisement"
            >
              <div className="relative w-4 h-4">
                <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
              </div>
            </button>
          )}

          {filteredAds.map((currentAd, index) => {
            const imageSource = getImageSource(currentAd)
            const isCurrentSlide = index === currentSlide

            const SlideContent = () => (
              <div
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
                  isCurrentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Image container */}
                <div className="absolute inset-0 w-full h-full">
                  {!imageErrors[currentAd._id] ? (
                    imageSource.startsWith("http") &&
                    typeof window !== "undefined" &&
                    !imageSource.startsWith(window.location.origin) ? (
                      <img
                        src={imageSource || "/placeholder.svg"}
                        alt={currentAd.title || "Advertisement"}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(currentAd._id)}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    ) : (
                      <Image
                        src={imageSource || "/placeholder.svg"}
                        alt={currentAd.title || "Advertisement"}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(currentAd._id)}
                        priority={index === 0}
                        unoptimized={imageSource.startsWith("data:")}
                        sizes="100vw"
                        quality={80}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5drrMNN91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Image not available</span>
                    </div>
                  )}

                  {/* Gradient overlay for text readability */}
                  {(currentAd.title || currentAd.subtitle || currentAd.description) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent sm:from-black/60 sm:via-black/40" />
                  )}
                </div>

                {/* Content overlay */}
                <div className="relative h-full container mx-auto px-4 flex items-center">
                  {(currentAd.title || currentAd.subtitle || currentAd.description) && (
                    <div className="w-full sm:w-2/3 md:w-1/2 lg:w-2/5 text-left z-10 p-4 md:p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                      {currentAd.title && (
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-white drop-shadow-md">
                          {currentAd.title}
                        </h2>
                      )}
                      {currentAd.subtitle && (
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white drop-shadow-lg">
                          {currentAd.subtitle}
                        </div>
                      )}
                      {currentAd.description && (
                        <p className="text-base sm:text-lg text-white/90 drop-shadow-md mb-4">
                          {currentAd.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )

            return (
              <div key={currentAd._id} className="h-full">
                {currentAd.linkUrl ? (
                  <Link href={currentAd.linkUrl}>
                    <SlideContent />
                  </Link>
                ) : (
                  <SlideContent />
                )}
              </div>
            )
          })}

          {filteredAds.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {filteredAds.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    currentSlide === index ? "bg-white" : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {filteredAds.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  goToSlide((currentSlide - 1 + filteredAds.length) % filteredAds.length)
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 z-20 backdrop-blur-sm flex items-center justify-center group"
                aria-label="Previous slide"
              >
                <div className="w-2 h-2 border-l-2 border-b-2 border-white transform rotate-45 group-hover:scale-110 transition-transform"></div>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  goToSlide((currentSlide + 1) % filteredAds.length)
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 z-20 backdrop-blur-sm flex items-center justify-center group"
                aria-label="Next slide"
              >
                <div className="w-2 h-2 border-r-2 border-t-2 border-white transform rotate-45 group-hover:scale-110 transition-transform"></div>
              </button>
            </>
          )}

          {filteredAds.length > 1 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all duration-500 ease-linear"
                style={{
                  width: `${((currentSlide + 1) / filteredAds.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
