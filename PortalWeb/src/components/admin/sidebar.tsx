"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Star,
  Store,
  PackageOpen,
  Package,
  UserCheck,
  ShoppingBag,
  Settings,
  Video,
  ImageIcon,
  MessageSquare,
  X,
  MessageCircle,
  BarChart3,
  Briefcase,
  UserCircle,
  FileText,
  ChevronDown,
  Tag,
} from "lucide-react"

const sidebarItems = [
  {
    href: "/admin",
    title: "Dashboard",
    icon: LayoutDashboard,
    type: "single",
  },
  {
    href: "/admin/users",
    title: "Users",
    icon: Users,
    type: "single",
  },
  {
    title: "Products",
    icon: Package,
    type: "dropdown",
    items: [
      {
        href: "/admin/quotations",
        title: "Product Quotations",
        icon: FileText,
      },
      {
        href: "/admin/reviews",
        title: "Product Reviews",
        icon: Star,
      },
      {
        href: "/admin/order-manager",
        title: "Order Manager",
        icon: PackageOpen,
      },
    ],
  },
  {
    title: "Customers",
    icon: UserCheck,
    type: "dropdown",
    items: [
      {
        href: "/admin/customer-reviews",
        title: "Customer Reviews",
        icon: MessageSquare,
      },
      {
        href: "/admin/customer-query",
        title: "Customer Query",
        icon: MessageSquare,
      },
      {
        href: "/admin/feedbacks",
        title: "Customer Feedbacks",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Sellers",
    icon: ShoppingBag,
    type: "dropdown",
    items: [
      {
        href: "/admin/sellers",
        title: "Seller Management",
        icon: Store,
      },
    ],
  },
  {
    title: "Career",
    icon: Briefcase,
    type: "dropdown",
    items: [
      {
        href: "/admin/careers",
        title: "Job Postings",
        icon: Briefcase,
      },
      {
        href: "/admin/applicants",
        title: "Applicants",
        icon: UserCircle,
      },
    ],
  },
  {
    title: "Admin Features",
    icon: Settings,
    type: "dropdown",
    items: [
      {
        href: "/admin/advertisements",
        title: "Advertisements",
        icon: ImageIcon,
      },
      {
        href: "/admin/promotion-settings",
        title: "Promotion Settings",
        icon: Video,
      },
      {
        href: "/admin/coupons",
        title: "Coupon Management",
        icon: Tag,
      },
      {
        href: "/admin/whatsapp/campaigns",
        title: "WhatsApp Campaigns",
        icon: MessageCircle,
      },
      {
        href: "/admin/whatsapp/analytics",
        title: "WhatsApp Analytics",
        icon: BarChart3,
      },
    ],
  },
]

interface SidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)

  const toggleDropdown = (title: string) => {
    setOpenDropdowns((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isDropdownOpen = (title: string) => openDropdowns.includes(title)

  const isDropdownActive = (items: any[]) => {
    return items.some((item) => pathname === item.href)
  }

  const handleDropdownHover = (title: string, isHovering: boolean) => {
    if (isHovering) {
      setHoveredDropdown(title)
    } else {
      setHoveredDropdown(null)
    }
  }

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
        w-80 md:w-64 bg-white border-r flex-shrink-0
        md:relative md:translate-x-0 md:block
        ${isMobileMenuOpen ? "fixed top-0 left-0 h-full z-50 transform translate-x-0" : "hidden md:block"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="sticky top-0 h-screen flex flex-col">
          <div className="flex items-center justify-between py-6 px-4 border-b">
            <h2 className="text-xl font-bold tracking-tight">Admin Dashboard</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="py-4 px-2 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title}>
                  {item.type === "single" ? (
                    <Link
                      href={item.href!}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-100 font-medium",
                        pathname === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  ) : (
                    <div
                      onMouseEnter={() => handleDropdownHover(item.title, true)}
                      onMouseLeave={() => handleDropdownHover(item.title, false)}
                    >
                      <button
                        onClick={() => toggleDropdown(item.title)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-100 font-medium",
                          isDropdownActive(item.items!) || hoveredDropdown === item.title
                            ? "bg-gray-50 text-gray-900"
                            : "text-gray-600",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          {item.title}
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isDropdownOpen(item.title) ? "rotate-180" : "rotate-0",
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isDropdownOpen(item.title) ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                        )}
                      >
                        <div className="ml-4 mt-1 space-y-1 pb-1">
                          {item.items!.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-100 font-medium hover:translate-x-1",
                                pathname === subItem.href
                                  ? "bg-gray-100 text-gray-900 border-l-2 border-blue-500"
                                  : "text-gray-600",
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <subItem.icon className="h-4 w-4" />
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}