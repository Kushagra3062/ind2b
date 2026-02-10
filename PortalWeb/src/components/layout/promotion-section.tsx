"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"

interface PromotionSettings {
  videoId: string
  bannerImageUrl?: string
  bannerImageData?: string
  isActive: boolean
}

let promotionCache: { data: PromotionSettings; timestamp: number } | null = null
const CACHE_DURATION = 20 * 60 * 1000 // 20 minutes

export default function PromotionSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [settings, setSettings] = useState<PromotionSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (promotionCache && Date.now() - promotionCache.timestamp < CACHE_DURATION) {
          console.log("[v0] Using cached promotion settings from client")
          setSettings(promotionCache.data)
          setLoading(false)
          return
        }

        const response = await fetch("/api/admin/promotion-settings")
        const result = await response.json()

        if (result.success && result.data) {
          promotionCache = {
            data: result.data,
            timestamp: Date.now(),
          }
          setSettings(result.data)
        }
      } catch (error) {
        console.error("Error fetching promotion settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const youtubeVideoId = settings?.videoId || "wG6yqAFZk04?si=ZkkGNr4oGsRoDkpB"
  const bannerImage = settings?.bannerImageData || settings?.bannerImageUrl || "/promotion_banner.jpg"

  const handlePlayVideo = () => {
    setIsVideoPlaying(true)
  }

  const handleVideoEnd = () => {
    setIsVideoPlaying(false)
  }

  if (loading) {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-2">PROMOTION</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Live shopping | Explore top deals</h2>
            <p className="text-gray-600 text-lg">Introducing the new collections</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
              <div className="bg-gray-200 animate-pulse"></div>
              <div className="bg-gray-100 p-8 lg:p-12 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-2">PROMOTION</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Live shopping | Explore top deals</h2>
          <p className="text-gray-600 text-lg">Introducing the new collections</p>
        </div>

        {/* Main Promotional Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
            {/* Left Side - Video/Image Section */}
            <div className="relative bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 overflow-hidden rounded-tl-2xl rounded-bl-2xl lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none aspect-video lg:aspect-auto">
              {!isVideoPlaying ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-tl-2xl rounded-bl-2xl lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none"
                    style={{
                      backgroundImage: `url('${bannerImage}')`, // Use dynamic banner image
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-tl-2xl rounded-bl-2xl lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none"></div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handlePlayVideo}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-6 shadow-lg transition-all duration-300 hover:scale-110 group"
                      aria-label="Play promotional video"
                    >
                      <Play
                        className="w-8 h-8 text-gray-800 ml-1 group-hover:text-orange-500 transition-colors"
                        fill="currentColor"
                      />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black rounded-tl-2xl rounded-bl-2xl lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none">
                  <div className="relative w-full h-full">
                    <iframe
                      className="w-full h-full rounded-tl-2xl rounded-bl-2xl lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                      title="Promotional Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ aspectRatio: "16/9" }}
                    />

                    {/* Close button for video */}
                    <button
                      onClick={() => setIsVideoPlaying(false)}
                      className="absolute top-2 right-2 md:top-4 md:right-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-1.5 md:p-2 transition-all duration-200 z-10"
                      aria-label="Close video"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Content Section */}
            <div className="bg-gray-100 p-8 lg:p-12 flex flex-col justify-center rounded-tr-2xl rounded-br-2xl lg:rounded-tl-none lg:rounded-bl-none">
              <div className="space-y-6">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Connecting You to Reliable Buyers & Sellers Worldwide
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Maximize your inventory value with secure and seamless transactions
                </p>

                <div className="pt-4">
                  <Link href="/seller">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
                      size="lg"
                    >
                      Join as a Seller
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
