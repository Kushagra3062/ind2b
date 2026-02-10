"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Building2, User, MapPin, CreditCard, FileImage, Loader2 } from "lucide-react"
import type { TabType } from "@/types/profile"

export function ProfileSuccess() {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("business")

  // Define all tabs as completed
  const tabs: { label: string; value: TabType }[] = [
    { label: "Business", value: "business" },
    { label: "Contact", value: "contact" },
    { label: "Category", value: "category" },
    { label: "Address", value: "addresses" },
    { label: "Bank", value: "bank" },
    { label: "Documents", value: "documents" },
  ]

  // Calculate progress based on active tab
  const getProgressPercentage = () => {
    const tabIndex = tabs.findIndex(tab => tab.value === activeTab)
    return ((tabIndex + 1) / tabs.length) * 100
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        console.log("Fetching profile data from API...")
        
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log("API response:", result)
        
        if (result.success) {
          console.log("Profile data loaded:", result.data)
          setProfileData(result.data)
        } else {
          console.error("API returned error:", result.error)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

           const renderBusinessDetails = () => (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <CardHeader className="relative flex flex-row items-center space-y-0 pb-4 border-b border-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Business Details</CardTitle>
              <p className="text-sm text-green-600 font-medium">Company Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Legal Entity Name</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.legalEntityName || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Trade Name</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.tradeName || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">GSTIN</p>
              </div>
              <p className="text-sm font-mono font-medium text-gray-800">{profileData?.business?.gstin || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Entity Type</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.businessEntityType || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Country</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.country || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">State</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.state || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">City</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.city || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Pincode</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.business?.pincode || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )

     const renderContactDetails = () => (
     <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
       <CardHeader className="relative flex flex-row items-center space-y-0 pb-4 border-b border-green-100">
         <div className="flex items-center space-x-3">
           <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
             <User className="h-6 w-6 text-white" />
           </div>
           <div>
             <CardTitle className="text-xl font-bold text-gray-800">Contact Details</CardTitle>
             <p className="text-sm text-green-600 font-medium">Personal Information</p>
           </div>
         </div>
       </CardHeader>
       <CardContent className="relative pt-6 space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
             <div className="flex items-center space-x-2 mb-2">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Contact Name</p>
             </div>
             <p className="text-sm font-medium text-gray-800">{profileData?.contact?.contactName || "Not provided"}</p>
           </div>
           <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
             <div className="flex items-center space-x-2 mb-2">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Email ID</p>
             </div>
             <p className="text-sm font-medium text-gray-800">{profileData?.contact?.emailId || "Not provided"}</p>
           </div>
           <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
             <div className="flex items-center space-x-2 mb-2">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Phone Number</p>
             </div>
             <p className="text-sm font-medium text-gray-800">{profileData?.contact?.phoneNumber || "Not provided"}</p>
           </div>
           <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
             <div className="flex items-center space-x-2 mb-2">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Pickup Time</p>
             </div>
             <p className="text-sm font-medium text-gray-800">{profileData?.contact?.pickupTime || "Not provided"}</p>
           </div>
         </div>
       </CardContent>
     </Card>
   )

           const renderCategoryDetails = () => (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <CardHeader className="relative flex flex-row items-center space-y-0 pb-4 border-b border-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Category & Brand Details</CardTitle>
              <p className="text-sm text-green-600 font-medium">Product Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6 space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Selected Categories</p>
            </div>
            {profileData?.category?.categories && profileData.category.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.category.categories.map((category: string, index: number) => (
                  <Badge key={index} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    {category}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 italic">No categories selected</p>
              </div>
            )}
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Authorized Brands</p>
            </div>
            {profileData?.category?.authorizedBrands && profileData.category.authorizedBrands.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.category.authorizedBrands.map((brand: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                    {brand}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 italic">No brands selected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )

           const renderAddressDetails = () => (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <CardHeader className="relative flex flex-row items-center space-y-0 pb-4 border-b border-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Address Details</CardTitle>
              <p className="text-sm text-green-600 font-medium">Location Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6 space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Billing Address</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800">
                  {profileData?.address?.billingAddress?.addressLine1 || "Not provided"}
                </p>
                {profileData?.address?.billingAddress?.addressLine2 && (
                  <p className="text-sm text-gray-700">{profileData.address.billingAddress.addressLine2}</p>
                )}
                <p className="text-sm text-gray-700">
                  {profileData?.address?.billingAddress?.city && profileData?.address?.billingAddress?.state && (
                    `${profileData.address.billingAddress.city}, ${profileData.address.billingAddress.state}`
                  )}
                </p>
                {profileData?.address?.billingAddress?.phoneNumber && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-gray-700">Phone: {profileData.address.billingAddress.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Pickup Address</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800">
                  {profileData?.address?.pickupAddress?.addressLine1 || "Not provided"}
                </p>
                {profileData?.address?.pickupAddress?.addressLine2 && (
                  <p className="text-sm text-gray-700">{profileData.address.pickupAddress.addressLine2}</p>
                )}
                <p className="text-sm text-gray-700">
                  {profileData?.address?.pickupAddress?.city && profileData?.address?.pickupAddress?.state && (
                    `${profileData.address.pickupAddress.city}, ${profileData.address.pickupAddress.state}`
                  )}
                </p>
                {profileData?.address?.pickupAddress?.phoneNumber && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-gray-700">Phone: {profileData.address.pickupAddress.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )

           const renderBankDetails = () => (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <CardHeader className="relative flex flex-row items-center space-y-0 pb-4 border-b border-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Bank Details</CardTitle>
              <p className="text-sm text-green-600 font-medium">Financial Information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Account Holder</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.bank?.accountHolderName || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Account Number</p>
              </div>
              <p className="text-sm font-mono font-medium text-gray-800">{profileData?.bank?.accountNumber || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Bank Name</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.bank?.bankName || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">IFSC Code</p>
              </div>
              <p className="text-sm font-mono font-medium text-gray-800">{profileData?.bank?.ifscCode || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Branch</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.bank?.branch || "Not provided"}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Account Type</p>
              </div>
              <p className="text-sm font-medium text-gray-800">{profileData?.bank?.accountType || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )

           const renderDocumentDetails = () => (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <CardHeader className="relative flex flex-row items-center space-y-0 pb-4 border-b border-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
              <FileImage className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Document Details</CardTitle>
              <p className="text-sm text-green-600 font-medium">Verification Documents</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">PAN Card</p>
              </div>
              <div className="text-center">
                {profileData?.document?.panCardUrl && 
                 profileData.document.panCardUrl !== "placeholder-pancard-url" &&
                 profileData.document.panCardUrl !== "pancard-uploaded-placeholder" ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Successfully Uploaded</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Not provided</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Aadhar Card</p>
              </div>
              <div className="text-center">
                {profileData?.document?.aadharCardUrl && 
                 profileData.document.aadharCardUrl !== "placeholder-aadharcard-url" &&
                 profileData.document.aadharCardUrl !== "aadharcard-uploaded-placeholder" ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Successfully Uploaded</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">Not provided</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
      {/* Header with Success Message on the right */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left side - Header content */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Profile Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Update your business and personal information here.
            </p>
          </div>

                     {/* Right side - Success Message */}
           <div className="lg:w-[500px] flex-shrink-0">
             <div className="relative">
               {/* Message Bubble */}
               <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg p-4 sm:p-6 relative">
                 {/* Message Tail */}
                 <div className="absolute -left-3 top-6 w-6 h-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l border-b border-green-200 transform rotate-45"></div>
                 
                 <div className="flex items-center gap-3 mb-3">
                   {/* Success Icon */}
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                     <CheckCircle className="w-6 h-6 text-green-600" />
                   </div>
                   
                   {/* Success Message */}
                   <div className="flex-1">
                     <h2 className="text-lg font-bold text-green-800 mb-1">
                       🎉 Congratulations!
                     </h2>
                     <p className="text-sm text-green-700">
                       Profile submitted successfully!
                     </p>
                   </div>
                 </div>

                 {/* Status Badge */}
                 <div className="flex items-center justify-between">
                   <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                     <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                     Under Review
                   </div>
                   <div className="text-xs text-green-600">
                     24-48 hours
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>

             {/* Progress Percentage Bar - Interactive */}
       <div className="w-full mb-6 sm:mb-8">
         <div className="flex justify-between mb-2">
           <span className="text-xs sm:text-sm font-medium">Profile Completion</span>
           <span className="text-xs sm:text-sm font-medium">{Math.round(getProgressPercentage())}%</span>
         </div>
         <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
           <div
             className="bg-green-900 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-in-out"
             style={{ width: `${getProgressPercentage()}%` }}
           ></div>
         </div>
         <div className="flex justify-between mt-2">
           {tabs.map((tab, index) => (
             <button
               key={tab.value}
               onClick={() => setActiveTab(tab.value)}
               className="flex flex-col items-center cursor-pointer transition-colors hover:opacity-80"
             >
               <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-colors ${
                 activeTab === tab.value ? 'bg-green-600 ring-2 ring-green-300' : 'bg-green-900'
               }`}></div>
               <span className={`text-[10px] sm:text-xs mt-1 hidden sm:block md:block transition-colors ${
                 activeTab === tab.value ? 'text-green-600 font-medium' : 'text-gray-600'
               }`}>
                 {/* Show abbreviated labels on small screens */}
                 {window.innerWidth < 640 && index > 0 && index < tabs.length - 1
                   ? tab.label.substring(0, 1)
                   : tab.label}
               </span>
             </button>
           ))}
         </div>
       </div>

             {/* Profile Data Display - Tabbed Interface */}
       <div className="space-y-6">
         <h3 className="text-xl font-semibold text-center mb-6">
           {tabs.find(tab => tab.value === activeTab)?.label} Information
         </h3>
         
         {/* Tab Content */}
         <div className="min-h-[400px]">
           {activeTab === "business" && renderBusinessDetails()}
           {activeTab === "contact" && renderContactDetails()}
           {activeTab === "category" && renderCategoryDetails()}
           {activeTab === "addresses" && renderAddressDetails()}
           {activeTab === "bank" && renderBankDetails()}
           {activeTab === "documents" && renderDocumentDetails()}
         </div>
       </div>
    </div>
  )
}
