"use client"

import { useState, useEffect } from "react"
import { Clock, TrendingUp, Users, Headphones } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
}

export default function SellerSignupOffer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime()
      const fortyEightHoursInMs = 48 * 60 * 60 * 1000
      const cycleNumber = Math.floor(now / fortyEightHoursInMs)
      const cycleStartTime = cycleNumber * fortyEightHoursInMs
      const cycleEndTime = cycleStartTime + fortyEightHoursInMs
      const difference = cycleEndTime - now

      if (difference > 0) {
        return {
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return { hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    router.push("/seller/light-onboarding")
  }

  if (!mounted) {
    return (
      <section className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-3">
        <div className="container mx-auto px-4">
          <div className="h-12 flex items-center justify-center">
            <div className="animate-pulse text-gray-400 text-sm">Loading offer...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left: Main Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg leading-tight">Become a Seller Today!</h2>
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="text-orange-400 font-semibold">Offer ending soon!</span> Join free as our esteemed
                  seller
                </p>
              </div>
            </div>

            {/* Center: Benefits */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-gray-300">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium">Zero Commission</span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium">Reach Millions</span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Headphones className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium">24/7 Support</span>
              </div>
            </div>

            {/* Right: Countdown & CTA */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5">
                <div className="text-center">
                  <div className="bg-gray-700 rounded px-2 py-1 min-w-[40px]">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[9px] uppercase mt-0.5 block">Hrs</span>
                </div>
                <span className="text-gray-500 font-bold">:</span>
                <div className="text-center">
                  <div className="bg-gray-700 rounded px-2 py-1 min-w-[40px]">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[9px] uppercase mt-0.5 block">Min</span>
                </div>
                <span className="text-gray-500 font-bold">:</span>
                <div className="text-center">
                  <div className="bg-gray-700 rounded px-2 py-1 min-w-[40px]">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[9px] uppercase mt-0.5 block">Sec</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 text-sm whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AuthModal with seller type pre-selected */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultType="seller"
      />
    </>
  )
}
