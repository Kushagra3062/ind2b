"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Remove lazy loading for critical hero content - load immediately
const SimpleSlider = dynamic(() => import("./SimpleSlider"), {
  ssr: true,
  loading: () => (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="animate-pulse flex space-x-4 w-full max-w-4xl">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="w-64 h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  ),
})

export function LazySimpleSlider() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <div className="animate-pulse flex space-x-4 w-full max-w-4xl">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="w-64 h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <SimpleSlider />
    </Suspense>
  )
}
