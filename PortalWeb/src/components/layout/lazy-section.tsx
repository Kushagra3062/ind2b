"use client"

import type React from "react"
import { useLazyLoad } from "@/hooks/use-lazy-load"

interface LazySectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  threshold?: number
  rootMargin?: string
  className?: string
}

export function LazySection({
  children,
  fallback,
  delay = 0,
  threshold = 0.1,
  rootMargin = "50px",
  className = "",
}: LazySectionProps) {
  const { elementRef, shouldLoad, isLoading } = useLazyLoad({
    delay,
    threshold,
    rootMargin,
  })

  return (
    <div ref={elementRef} className={className}>
      {shouldLoad ? children : isLoading || fallback ? fallback : null}
    </div>
  )
}
