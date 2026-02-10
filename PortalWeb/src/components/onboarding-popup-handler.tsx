"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { getCurrentUser } from "@/actions/auth"
import { OnboardingCompletionModal } from "@/components/seller/onboarding-completion-modal"

export function OnboardingPopupHandler() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Only show popup on homepage
        if (pathname !== "/") {
          setShowOnboardingModal(false)
          return
        }

        // Only check once per session to avoid repeated checks
        if (hasChecked) return

        const user = await getCurrentUser()
        if (user && user.type === "seller" && user.onboardingStatus === "light_completed") {
          // Check if user has completed the heavy form by checking profile progress
          const response = await fetch("/api/seller/profile-status")
          if (response.ok) {
            const data = await response.json()
            // If status is still "Pending Completion", show modal
            if (data.status === "Pending Completion") {
              setShowOnboardingModal(true)
            }
          }
        }
        setHasChecked(true)
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      }
    }

    checkOnboardingStatus()
  }, [pathname, hasChecked])

  const handleClose = () => {
    setShowOnboardingModal(false)
  }

  return (
    <OnboardingCompletionModal
      isOpen={showOnboardingModal}
      onClose={handleClose}
    />
  )
}
