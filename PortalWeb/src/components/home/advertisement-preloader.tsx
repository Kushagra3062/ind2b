"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchAdvertisements } from "@/store/slices/advertisementSlice"
import type { AppDispatch } from "@/store"

export default function AdvertisementPreloader() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Preload advertisements for all device types in the background
    const preloadAdvertisements = async () => {
      try {
        // Detect device type
        let deviceType = "desktop"
        if (typeof window !== "undefined") {
          const width = window.innerWidth
          if (width < 768) deviceType = "mobile"
          else if (width < 1024) deviceType = "tablet"
        }

        // Preload advertisements for homepage slider
        await dispatch(fetchAdvertisements({ deviceType, position: "homepage" }))
        console.log("Advertisements preloaded successfully")
      } catch (error) {
        console.warn("Failed to preload advertisements:", error)
      }
    }

    // Start preloading immediately
    preloadAdvertisements()

    // Also preload for other device types to improve cache hit rate
    const preloadAllDeviceTypes = async () => {
      const deviceTypes = ["mobile", "tablet", "desktop"]
      for (const type of deviceTypes) {
        try {
          await dispatch(fetchAdvertisements({ deviceType: type, position: "homepage" }))
        } catch (error) {
          // Ignore errors for non-primary device types
        }
      }
    }

    // Preload other device types after a short delay
    const timeoutId = setTimeout(preloadAllDeviceTypes, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [dispatch])

  // This component doesn't render anything visible
  return null
}



