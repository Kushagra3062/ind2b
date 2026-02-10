"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/actions/auth"
import { LightSellerForm } from "@/components/auth/light-seller-form"

export default function LightOnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser || currentUser.type !== "seller") {
          router.push("/")
          return
        }
        
        
        if (currentUser.onboardingStatus === "light_completed") {
          router.push("/seller/profile")
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSuccess = () => {
    
    router.push("/seller/profile")
  }

  const handleCancel = () => {
    
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LightSellerForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}