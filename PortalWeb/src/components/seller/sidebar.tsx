"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package2,
  ClipboardList,
  Star,
  UserCircle,
  HelpCircle,
  Menu,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const toggleSidebar = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Only redirect on initial load when pathname is exactly /seller or /seller/
  useEffect(() => {
    // Only redirect if we're exactly at /seller or /seller/
    if ((pathname === "/seller" || pathname === "/seller/") && !searchParams.toString()) {
      router.push("/seller/profile")
    }
  }, []) // Empty dependency array means this only runs once on component mount

  const navItems = [
    { href: "/seller?view=dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/products", icon: Package2, label: "Product Management" },
    { href: "/seller/orders", icon: ClipboardList, label: "Order Management" },
    { href: "/seller/quotations", icon: MessageSquare, label: "Quotation Requests" },
    { href: "/seller/reviews", icon: Star, label: "Ratings & Reviews" },
    { href: "/seller/profile", icon: UserCircle, label: "Profile Management" },
    { href: "/seller/help", icon: HelpCircle, label: "Help/Support" },
  ]

  // Check if the current path matches the nav item's href
  const isActive = (path: string) => {
    if (path.includes("?")) {
      // For paths with query parameters (like /seller?view=dashboard)
      const [basePath, queryString] = path.split("?")
      const query = new URLSearchParams(queryString)
      const view = query.get("view")

      return pathname === basePath && searchParams.get("view") === view
    }

    // For regular paths
    return pathname === path
  }

  return (
    <div className="relative h-full">
      {/* Toggle button moved inside the main container and hidden when sidebar is open */}
      <Button
        variant="ghost"
        size="icon"
        className={`md:hidden absolute top-4 left-4 z-30 ${isOpen ? "invisible" : "visible"}`}
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-40 w-64 
          bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-900">Seller Portal</h1>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-1">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    active ? "bg-green-900 text-white" : "hover:bg-green-900 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
