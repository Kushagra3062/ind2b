"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useEffect } from "react"

export default function NotFound() {
  const router = useRouter()

  // Handle navigation without causing a full page reload
  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/")
  }

  // Prevent automatic scroll to top when component mounts
  useEffect(() => {
    // Store the current scroll position
    const scrollPosition = window.scrollY

    // Return a cleanup function that restores the scroll position
    return () => {
      // This will run when navigating away from this page
      // We use setTimeout to ensure it runs after the navigation
      setTimeout(() => {
        window.scrollTo(0, scrollPosition)
      }, 0)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">🚧</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanks for your visit!</h1>
          <p className="text-gray-600 mb-6">
            This page is coming soon. We're working hard to bring you an amazing experience.
          </p>

          <Button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
