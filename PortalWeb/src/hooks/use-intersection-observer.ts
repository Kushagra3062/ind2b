"use client"

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseIntersectionObserverProps = {}) {
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: immediately set as intersected if IntersectionObserver is not supported
      if (isMountedRef.current) {
        setHasIntersected(true)
      }
      return
    }

    try {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && isMountedRef.current) {
              setHasIntersected(true)
              if (triggerOnce && observerRef.current) {
                observerRef.current.disconnect()
              }
            }
          },
          {
            threshold,
            rootMargin,
          },
        )
      }

      observerRef.current.observe(element)
    } catch (error) {
      console.error("[v0] IntersectionObserver error:", error)
      // Fallback on error
      if (isMountedRef.current) {
        setHasIntersected(true)
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return {
    elementRef,
    hasIntersected,
  }
}
