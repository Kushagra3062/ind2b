"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, LogOut, Menu, X, Search } from "lucide-react"
import { AuthModal } from "../auth/auth-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/auth"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store"
import { clearCart } from "@/store/slices/cartSlice"
import { clearWishlist } from "@/store/slices/wishlistSlice"
import { useRouter } from "next/navigation"
import EnhancedSearchBar from "./enhanced-search-bar"
import { requestIdleCallback } from "@/lib/request-idle-callback-polyfill"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
    type: "admin" | "seller" | "customer"
  } | null
}

interface Category {
  name: string
  count: number
  sampleImage: string
  avgPrice: number
  subcategories: string[]
}

export default function Header({ user }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [justLoggedInUser, setJustLoggedInUser] = useState<{
    id: string
    name: string
    email: string
    type: "admin" | "seller" | "customer"
  } | null>(null)

  const dispatch = useDispatch()

  const cartItemsCount = useSelector((state: RootState) => state.cart.items.length)
  const wishlistItemsCount = useSelector((state: RootState) => state.wishlist.items.length)

  const router = useRouter()

  const SCROLL_INTERVAL = 5000
  const CATEGORIES_PER_VIEW = 8

  useEffect(() => {
    if (user && justLoggedInUser) {
      setJustLoggedInUser(null)
    }
  }, [user, justLoggedInUser])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const fetchCategories = async () => {
      try {
        setIsLoading(true)

        const cachedCategories = sessionStorage.getItem("header-categories")
        if (cachedCategories) {
          const parsed = JSON.parse(cachedCategories)
          if (Date.now() - parsed.timestamp < 300000) {
            setCategories(parsed.data)
            setIsLoading(false)
            return
          }
        }

        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)

          sessionStorage.setItem(
            "header-categories",
            JSON.stringify({
              data,
              timestamp: Date.now(),
            }),
          )
        } else {
          console.error("Failed to fetch categories")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    requestIdleCallback(fetchCategories)
  }, [isClient])

  useEffect(() => {
    if (categories.length <= CATEGORIES_PER_VIEW) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length)
    }, SCROLL_INTERVAL)

    return () => clearInterval(interval)
  }, [categories.length])

  const visibleCategories = useMemo(() => {
    if (categories.length === 0) return []

    const visible = []
    for (let i = 0; i < CATEGORIES_PER_VIEW; i++) {
      const categoryIndex = (currentIndex + i) % categories.length
      visible.push(categories[categoryIndex])
    }
    return visible
  }, [categories, currentIndex])

  function handleAuthSuccess(userData?: {
    id: string
    name: string
    email: string
    type: "admin" | "seller" | "customer"
  }) {
    setIsAuthModalOpen(false)

    if (userData) {
      setJustLoggedInUser(userData)
      setIsLoggedOut(false)

      router.refresh()

      if (userData.type === "admin") {
        router.push("/admin")
      } else if (userData.type === "seller") {
        router.push("/seller")
      } else {
        router.push("/dashboard")
      }
    } else if (user) {
      if (user.type === "admin") {
        router.push("/admin")
      } else if (user.type === "seller") {
        router.push("/seller")
      } else {
        router.push("/dashboard")
      }
    }
  }

  function navigateToDashboard() {
    const currentUser = justLoggedInUser || user
    if (currentUser) {
      if (currentUser.type === "admin") {
        router.push("/admin")
      } else if (currentUser.type === "seller") {
        router.push("/seller")
      } else {
        router.push("/dashboard")
      }
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    // Category navigation logic
  }

  const handleLogout = async () => {
    setIsLoggedOut(true)
    setJustLoggedInUser(null)
    dispatch(clearCart())
    dispatch(clearWishlist())

    await signOut()

    router.refresh()

    router.push("/")
  }

  const displayUser = justLoggedInUser || user

  if (!isClient) {
    return (
      <header className="w-full bg-white shadow-sm">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="w-full px-2 sm:px-4 lg:px-6 pb-0.5 pt-1.5 sm:pb-1 sm:pt-2 bg-white">
            <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="flex-1 max-w-xl lg:max-w-2xl mx-1 sm:mx-2">
                <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
          <div className="bg-orange-600 h-12 w-full"></div>
        </div>
        <div className="h-10 sm:h-12 lg:h-14"></div>
      </header>
    )
  }

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Main Header */}
        <div className="w-full px-2 sm:px-4 lg:px-6 pb-0.5 pt-1.5 sm:pb-1 sm:pt-2 bg-white">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo1.webp"
                  alt="IND2B Logo"
                  width={120}
                  height={80}
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                  priority
                  quality={90}
                />
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile when menu is open */}
            <div
              className={`flex-1 max-w-xl lg:max-w-2xl mx-1 sm:mx-2 ${isMobileMenuOpen ? "hidden sm:block" : "block"}`}
            >
              <EnhancedSearchBar />
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Wishlist - Hidden on mobile when menu is open */}
              <Link
                href="/dashboard/wishlist"
                className={`relative p-1 sm:p-1.5 lg:p-2 hover:bg-gray-100 rounded-full transition-colors ${isMobileMenuOpen ? "hidden sm:flex" : "flex"}`}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600 hover:text-red-500 transition-colors" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-[8px] sm:text-[10px] lg:text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistItemsCount > 99 ? "99+" : wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Cart - Hidden on mobile when menu is open */}
              <Link
                href="/cart"
                className={`relative p-1 sm:p-1.5 lg:p-2 hover:bg-gray-100 rounded-full transition-colors ${isMobileMenuOpen ? "hidden sm:flex" : "flex"}`}
              >
                <Image
                  src="/cart.webp"
                  alt="Shopping Cart"
                  width={24}
                  height={24}
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  priority
                />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-[8px] sm:text-[10px] lg:text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Menu/Login - Hidden on mobile when menu is open */}
              <div className={isMobileMenuOpen ? "hidden sm:block" : "block"}>
                {displayUser && !isLoggedOut ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-7 sm:h-8 lg:h-10 px-1.5 sm:px-2 lg:px-3 flex items-center gap-1 sm:gap-1.5 lg:gap-2 border-gray-300 hover:border-gray-400 transition-colors bg-transparent min-w-0"
                      >
                        <Avatar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6">
                          <AvatarImage src={`https://avatar.vercel.sh/${displayUser.id}`} />
                          <AvatarFallback className="text-[10px] sm:text-xs lg:text-sm">
                            {displayUser.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-[10px] sm:text-xs lg:text-sm font-medium truncate max-w-16 lg:max-w-20">
                          {displayUser.name.split(" ")[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={navigateToDashboard} className="cursor-pointer">
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="h-7 sm:h-8 lg:h-10 px-2 sm:px-3 lg:px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] sm:text-xs lg:text-base font-medium rounded-md transition-colors whitespace-nowrap min-w-0"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar - Expanded */}
          {isSearchExpanded && (
            <div className="sm:hidden px-4 py-2 bg-white border-t border-gray-200">
              <EnhancedSearchBar />
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-4 space-y-4">
                {/* Mobile User Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    href="/dashboard/wishlist"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Wishlist</span>
                    {wishlistItemsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {wishlistItemsCount > 99 ? "99+" : wishlistItemsCount}
                      </span>
                    )}
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Image src="/cart.webp" alt="Shopping Cart" width={20} height={20} className="w-5 h-5" />
                    <span className="text-sm font-medium">Cart</span>
                    {cartItemsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {cartItemsCount > 99 ? "99+" : cartItemsCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Mobile User Menu */}
                {displayUser && !isLoggedOut ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigateToDashboard()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${displayUser.id}`} />
                        <AvatarFallback className="text-xs">{displayUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{displayUser.name}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-orange-600 text-white overflow-hidden w-full">
          <div className="flex items-center py-1.5 sm:py-2 lg:py-2.5 px-2 sm:px-4 lg:px-6">
            <span className="text-xs sm:text-sm font-medium hidden sm:inline flex-shrink-0 mr-4 sm:mr-6">
              Categories:
            </span>

            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex space-x-3 sm:space-x-4 lg:space-x-6 animate-pulse">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-3 sm:h-4 bg-orange-400 rounded w-12 sm:w-16 lg:w-18 flex-shrink-0"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  {/* Mobile: Horizontal scroll */}
                  <div className="sm:hidden overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-4 pb-1">
                      {categories.map((category, index) => (
                        <Link
                          key={`${category.name}-${index}`}
                          href={`/categories/${encodeURIComponent(category.name)}`}
                          className="text-xs hover:text-gray-200 transition-colors flex-shrink-0 whitespace-nowrap px-2 py-1 rounded hover:bg-orange-500"
                          onClick={(e) => handleCategoryClick(e, category.name)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: Auto-scrolling */}
                  <div className="hidden sm:block">
                    <div
                      className="flex space-x-4 sm:space-x-6 transition-transform duration-1000 ease-in-out"
                      style={{
                        transform:
                          categories.length > CATEGORIES_PER_VIEW
                            ? `translateX(-${(currentIndex * 100) / categories.length}%)`
                            : "translateX(0)",
                      }}
                    >
                      {categories.concat(categories).map((category, index) => (
                        <Link
                          key={`${category.name}-${index}`}
                          href={`/categories/${encodeURIComponent(category.name)}`}
                          className="text-xs sm:text-sm hover:text-gray-200 transition-colors flex-shrink-0 whitespace-nowrap"
                          onClick={(e) => handleCategoryClick(e, category.name)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isLoading && categories.length > CATEGORIES_PER_VIEW && (
              <div className="hidden lg:flex items-center ml-4 space-x-1">
                {Array.from({ length: Math.min(categories.length, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex % Math.min(categories.length, 10) ? "bg-white w-3" : "bg-orange-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-10 sm:h-12 lg:h-14"></div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </header>
  )
}
