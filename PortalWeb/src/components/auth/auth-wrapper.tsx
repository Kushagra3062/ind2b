"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/actions/auth"
import { AuthModal } from "./auth-modal"
import toast from "react-hot-toast"

interface AuthWrapperProps {
  children: React.ReactNode
  requiredRole?: "admin" | "seller" | "customer"
}

export default function AuthWrapper({ children, requiredRole }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (!currentUser) {
          // User is not logged in, show auth modal
          setIsAuthModalOpen(true)
          setIsAuthenticated(false)
        } else if (requiredRole && currentUser.type !== requiredRole) {
          setIsAuthenticated(false)

          // Get portal name for notification
          const portalNames = {
            admin: "Admin Portal",
            seller: "Seller Portal",
            customer: "Customer Portal",
          }
          const attemptedPortal = portalNames[requiredRole]

          // Show access denied notification
          toast.error(`You have not access to this ${attemptedPortal}`, {
            duration: 3000,
            position: "top-center",
            style: {
              background: "#ef4444",
              color: "#fff",
              fontWeight: "500",
            },
          })

          // Redirect to the appropriate dashboard based on user's actual role
          setTimeout(() => {
            if (currentUser.type === "admin") {
              router.push("/admin")
            } else if (currentUser.type === "seller") {
              if (currentUser.onboardingStatus === "pending") {
                router.push("/seller/light-onboarding")
              } else {
                router.push("/seller/profile")
              }
            } else {
              router.push("/dashboard")
            }
          }, 500)
        } else {
          // User is authenticated and has the correct role
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthModalOpen(true)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false)
    setIsLoading(true)

    // Check user role after login
    const currentUser = await getCurrentUser()
    if (currentUser) {
      if (requiredRole && currentUser.type !== requiredRole) {
        const portalNames = {
          admin: "Admin Portal",
          seller: "Seller Portal",
          customer: "Customer Portal",
        }
        const attemptedPortal = portalNames[requiredRole]

        toast.error(`You have not access to this ${attemptedPortal}`, {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "#fff",
            fontWeight: "500",
          },
        })

        // Redirect to the appropriate dashboard based on role
        setTimeout(() => {
          if (currentUser.type === "admin") {
            window.location.href = "/admin"
          } else if (currentUser.type === "seller") {
            if (currentUser.onboardingStatus === "pending") {
              window.location.href = "/seller/light-onboarding"
            } else {
              window.location.href = "/seller/profile"
            }
          } else {
            window.location.href = "/dashboard"
          }
        }, 500)
      } else {
        // User has the correct role
        if (currentUser.type === "seller" && requiredRole === "seller") {
          // Check onboarding status and redirect accordingly
          if (currentUser.onboardingStatus === "pending") {
            window.location.href = "/seller/light-onboarding"
          } else {
            window.location.href = "/seller/profile"
          }
        } else {
          // For other roles, refresh the page
          window.location.reload()
        }
      }
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Only render children if authenticated and has correct role
  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          {/* This div ensures the dashboard is not visible at all */}
        </div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          router.push("/")
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
