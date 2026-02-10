"use client"

import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { fetchAdvertisements } from "@/store/slices/advertisementSlice"
import type { AppDispatch } from "@/store"

export default function AdvertisementPreloader() {
  const dispatch = useDispatch<AppDispatch>()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const hasPreloadedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    if (hasPreloadedRef.current) return

    const preloadAdvertisements = async () => {
      try {
        // Detect device type
        let deviceType = "desktop"
        if (typeof window !== "undefined") {
          const width = window.innerWidth
          if (width < 768) deviceType = "mobile"
          else if (width < 1024) deviceType = "tablet"
        }

        await dispatch(fetchAdvertisements({ deviceType })).unwrap()
        hasPreloadedRef.current = true
      } catch (error) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(async () => {
          if (isMountedRef.current && !hasPreloadedRef.current) {
            try {
              await dispatch(fetchAdvertisements({ deviceType: "all" })).unwrap()
              hasPreloadedRef.current = true
            } catch (retryError) {
              // Silently fail - ads are not critical
            }
          }
        }, 2000)
      }
    }

    // Start preloading immediately
    preloadAdvertisements()

    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [dispatch])

  // This component doesn't render anything visible
  return null
}
