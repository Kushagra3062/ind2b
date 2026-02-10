"use client"

import { useState } from "react"
import { TrendingUp, Package, CheckCircle, UserPlus, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/auth-modal"
import { useRouter } from "next/navigation"

const SellPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    router.push("/seller/light-onboarding")
  }

  return (
    <div className="min-h-screen flex flex-col gap-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Hero Section  */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-8 max-w-6xl mx-auto py-8">
          {/* Image Section */}
          <div className="w-full lg:w-1/3 flex justify-center order-1 lg:order-1">
            <img src="/sell.jpg" alt="Person" className="h-48 sm:h-56 lg:h-64 object-contain" />
          </div>

          {/*  Text + Stats */}
          <div className="text-center w-full lg:w-1/3 order-2 lg:order-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-6 px-4">
              Join millions of suppliers and buyers on India's trusted B2B network.
            </h2>

            <div className="flex flex-col sm:flex-row justify-around gap-4 sm:gap-2">
              {/* Buyers */}
              <div className="flex-1">
                <div className="text-blue-600 text-3xl sm:text-4xl">📈</div>
                <h3 className="font-semibold text-sm sm:text-base">20.6 crore+</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Buyers</p>
              </div>

              {/* Suppliers */}
              <div className="flex-1">
                <div className="text-blue-600 text-3xl sm:text-4xl">₹</div>
                <h3 className="font-semibold text-sm sm:text-base">82 lakh+</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Suppliers</p>
              </div>

              {/* Products */}
              <div className="flex-1">
                <div className="text-blue-600 text-3xl sm:text-4xl">📦</div>
                <h3 className="font-semibold text-sm sm:text-base">11.5 crore+</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Products & Services</p>
              </div>
            </div>
          </div>

          {/*  Join as Seller Button */}
          <div className="w-full lg:w-1/3 flex items-center justify-center order-3 lg:order-3">
            <div className="text-center">
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors duration-200 w-full sm:w-auto"
                size="lg"
              >
                Join as a Seller
              </Button>
              <p className="text-gray-600 mt-4 text-sm">Start your selling journey today</p>
            </div>
          </div>
        </div>

        {/* Benefits and Steps Section */}
        <div className="flex flex-col lg:flex-row justify-center items-start gap-6 lg:gap-8 max-w-6xl mx-auto py-8">
          {/*Benefits */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">Sell on IND2B</h2>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Grow your Business</h3>
                  <p className="text-sm sm:text-base text-gray-600">Sell to buyers anytime, anywhere across India</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Zero Cost</h3>
                  <p className="text-sm sm:text-base text-gray-600">No commission or transaction fees</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Manage your Business Better</h3>
                  <p className="text-sm sm:text-base text-gray-600">Advanced dashboard and lead management system</p>
                </div>
              </div>
            </div>
          </div>

          {/*  Steps */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">
              Get a free listing in 3 simple steps:
            </h2>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between items-start gap-6 sm:gap-4 lg:gap-6 xl:gap-8">
              <div className="flex-1 flex flex-col items-center text-center w-full sm:w-auto">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Create Account</h3>
                <p className="text-sm sm:text-base text-gray-600">Add your name and phone number to get started</p>
              </div>

              <div className="flex-1 flex flex-col items-center text-center w-full sm:w-auto">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Add Business</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Add name, address & email of your company, store or business
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center text-center w-full sm:w-auto">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Add Products</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Minimum 3 products/services needed for your free listing page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AuthModal with seller type pre-selected */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultType="seller"
      />
    </div>
  )
}

export default SellPage
