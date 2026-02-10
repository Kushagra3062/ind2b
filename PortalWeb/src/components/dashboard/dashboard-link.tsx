"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/actions/auth"

interface DashboardLinkProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLink({ children, className }: DashboardLinkProps) {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      const user = await getCurrentUser()

      if (user) {
        // Redirect based on user role
        if (user.type === "admin") {
          router.push("/admin")
        } else if (user.type === "seller") {
          router.push("/seller")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Not authenticated, show login modal
        router.push("/login?returnUrl=/dashboard")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/login?returnUrl=/dashboard")
    }
  }

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  )
}
