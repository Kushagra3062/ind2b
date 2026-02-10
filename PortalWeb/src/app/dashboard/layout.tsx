"use client"

import type React from "react"
import { useState } from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import AuthWrapper from "@/components/auth/auth-wrapper"
import { Menu, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <AuthWrapper requiredRole="customer">
      <div className="flex min-h-screen flex-col md:flex-row mt-6">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-12 left-4 z-50 p-2 bg-white rounded-lg shadow-md border"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>

        <DashboardSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Vertical Line */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50">{children}</main>
      </div>
    </AuthWrapper>
  )
}
