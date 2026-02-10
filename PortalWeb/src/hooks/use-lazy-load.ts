"use client"

import { useState, useEffect, useRef } from "react"
import { useIntersectionObserver } from "./use-intersection-observer"

interface UseLazyLoadProps {
  delay?: number
  threshold?: number
  rootMargin?: string
}

export function useLazyLoad({ delay = 0, threshold = 0.1, rootMargin = "100px" }: UseLazyLoadProps = {}) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (hasIntersected && !shouldLoad && isMountedRef.current) {
      setIsLoading(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShouldLoad(true)
          setIsLoading(false)
        }
        timerRef.current = null
      }, delay)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }, [hasIntersected, shouldLoad, delay])

  return {
    elementRef,
    shouldLoad,
    isLoading,
    hasIntersected,
  }
}
