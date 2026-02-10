"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import AuthWrapper from "@/components/auth/auth-wrapper"
import { Menu, X } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <AuthWrapper requiredRole="admin">
      <div className="min-h-screen bg-background">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-16 left-4 z-50 p-2 bg-white rounded-lg shadow-md border"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="flex">
          <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

          <main className="flex-1 min-h-screen pl-16 md:pl-0">{children}</main>
        </div>
      </div>
    </AuthWrapper>
  )
}
