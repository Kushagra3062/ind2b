"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { User, MapPin, ShoppingCart, Heart, ClipboardList, Lock, X, MessageSquare } from "lucide-react"

const navigation = [
  { name: "My Account", href: "/dashboard", icon: User },
  { name: "Address", href: "/dashboard/address", icon: MapPin },
  { name: "My Cart", href: "/dashboard/cart", icon: ShoppingCart },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { name: "My Quotations", href: "/dashboard/quotations", icon: MessageSquare },
  { name: "Order History", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Change Password", href: "/dashboard/password", icon: Lock },
]

interface DashboardSidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export default function DashboardSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
        w-80 md:w-64 bg-white border-b md:border-r md:border-b-0 pt-6
        md:relative md:translate-x-0 md:block
        ${isMobileMenuOpen ? "fixed top-0 left-0 h-full z-50 transform translate-x-0" : "hidden md:block"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="flex items-center justify-between p-4 border-b md:block">
          <h1 className="text-xl font-bold text-emerald-900">My Profile</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-emerald-900 text-white" : "text-gray-600 hover:bg-orange-500 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
