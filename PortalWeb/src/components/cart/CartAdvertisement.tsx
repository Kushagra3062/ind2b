"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAdvertisements, type Advertisement } from "@/store/slices/advertisementSlice"
import type { AppDispatch, RootState } from "@/store"

// Skeleton loading component for better UX
const AdvertisementSkeleton = () => (
  <div className="mt-16 sm:mt-20 flex justify-center">
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 rounded-[20px] animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-600 text-sm">Loading advertisements...</p>
        </div>
      </div>
    </div>
  </div>
)

export default function CartAdvertisement() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [deviceType, setDeviceType] = useState<string>("desktop")

  const dispatch = useDispatch<AppDispatch>()
  const { advertisements, status, error, isInitialized } = useSelector((state: RootState) => state.advertisements)

  // Optimized device type detection
  const getDeviceType = useCallback(() => {
    if (typeof window === "undefined") return "desktop"
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }, [])

  // Get filtered advertisements for the current device type and cart position
  const filteredAdvertisements = useMemo(() => {
    if (advertisements.length === 0) return []

    // Filter by device type, cart position, and sort by order
    return advertisements
      .filter(ad => 
        ad.isActive && 
        (ad.deviceType === deviceType || ad.deviceType === "all") &&
        ad.position === "cart"
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [advertisements, deviceType])

  // Get current advertisement
  const currentAd = useMemo(() => {
    if (filteredAdvertisements.length === 0) return null
    return filteredAdvertisements[currentAdIndex]
  }, [filteredAdvertisements, currentAdIndex])

  // Auto-rotate advertisements if there are multiple
  useEffect(() => {
    if (filteredAdvertisements.length <= 1) return

    const timer = setInterval(() => {
      setCurrentAdIndex(prevIndex => (prevIndex + 1) % filteredAdvertisements.length)
    }, 6000) // Change every 6 seconds

    return () => clearInterval(timer)
  }, [filteredAdvertisements.length])

  // Fetch advertisements on mount
  useEffect(() => {
    const initialDeviceType = getDeviceType()
    setDeviceType(initialDeviceType)

    if (!isInitialized || advertisements.length === 0) {
      dispatch(fetchAdvertisements({ deviceType: initialDeviceType, position: "cart" }))
    }
  }, [dispatch, getDeviceType, isInitialized, advertisements.length])

  // Handle device resize
  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType()
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType)
        setCurrentAdIndex(0) // Reset to first ad when device type changes
        if (advertisements.length === 0) {
          dispatch(fetchAdvertisements({ deviceType: newDeviceType, position: "cart" }))
        }
      }
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [dispatch, deviceType, getDeviceType, advertisements.length])

  // Handle manual navigation
  const goToAd = useCallback((index: number) => {
    if (index === currentAdIndex || index < 0 || index >= filteredAdvertisements.length) return
    setCurrentAdIndex(index)
  }, [currentAdIndex, filteredAdvertisements.length])

  // Check if advertisement has content
  const hasContent = useCallback((ad: Advertisement) => {
    return ad.title || ad.subtitle || ad.description
  }, [])

  // Show skeleton while loading
  if (status === "loading" && advertisements.length === 0 && !isInitialized) {
    return <AdvertisementSkeleton />
  }

  // Show nothing if no advertisements available
  if (!currentAd || filteredAdvertisements.length === 0) {
    return null
  }

  // Get image source
  const imageSource = currentAd.imageData || currentAd.imageUrl || "/placeholder.svg?height=400&width=1200"
  const hasSlideContent = hasContent(currentAd)

  return (
    <div className="mt-16 sm:mt-20 flex justify-center">
      <div className="relative w-full max-w-[1280px] h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 rounded-[20px]">
        {/* Image container - exactly like homepage */}
        <div className="absolute inset-0 w-full h-full">
          {!imageError ? (
            imageSource.startsWith("http") && typeof window !== "undefined" && !imageSource.startsWith(window.location.origin) ? (
              <img
                src={imageSource}
                alt={currentAd.title || "Advertisement"}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <Image
                src={imageSource}
                alt={currentAd.title || "Advertisement"}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority={false}
                unoptimized={imageSource.startsWith("data:")}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                quality={80}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            )
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}

          {/* Gradient overlay - exactly like homepage */}
          {hasSlideContent && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent sm:from-black/60 sm:via-black/40" />
          )}
        </div>

        {/* Content container - exactly like homepage */}
        <div className="relative h-full container mx-auto px-4 flex items-center">
          {hasSlideContent && (
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

              {currentAd.linkUrl && (
                <div className="mt-4">
                  <Link
                    href={currentAd.linkUrl}
                    className="inline-flex items-center px-4 py-2 bg-white text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors duration-300 text-sm"
                  >
                    Explore Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation dots - exactly like homepage */}
        {filteredAdvertisements.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {filteredAdvertisements.map((_, index) => (
              <button
                key={index}
                onClick={() => goToAd(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentAdIndex === index ? "bg-white" : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to advertisement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation arrows - exactly like homepage */}
        {filteredAdvertisements.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                goToAd((currentAdIndex - 1 + filteredAdvertisements.length) % filteredAdvertisements.length)
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 z-20 backdrop-blur-sm flex items-center justify-center group"
              aria-label="Previous advertisement"
            >
              <div className="w-2 h-2 border-l-2 border-b-2 border-white transform rotate-45 group-hover:scale-110 transition-transform"></div>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                goToAd((currentAdIndex + 1) % filteredAdvertisements.length)
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 z-20 backdrop-blur-sm flex items-center justify-center group"
              aria-label="Next advertisement"
            >
              <div className="w-2 h-2 border-r-2 border-t-2 border-white transform rotate-45 group-hover:scale-110 transition-transform"></div>
            </button>
          </>
        )}

        {/* Progress bar - exactly like homepage */}
        {filteredAdvertisements.length > 1 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-500 ease-linear"
              style={{
                width: `${((currentAdIndex + 1) / filteredAdvertisements.length) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
