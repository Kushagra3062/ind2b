"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit, FileText, Building2, User, MapPin, CreditCard, FileImage, ArrowLeft, Send } from "lucide-react"
import type { TabType } from "@/types/profile"
import { submitProfileForReview } from "@/actions/profile"
import { useToast } from "@/hooks/use-toast"

interface ProfileReviewProps {
  profileData: any
  onEdit: (tab: TabType) => void
  onSubmit: () => void
  onBack: () => void
}

export function ProfileReview({ profileData, onEdit, onSubmit, onBack }: ProfileReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Debug: Log the profile data to see what we're getting
  console.log("ProfileReview - Full profileData:", profileData)
  console.log("ProfileReview - Business data:", profileData?.business)
  console.log("ProfileReview - Contact data:", profileData?.contact)
  console.log("ProfileReview - Category data:", profileData?.category)
  console.log("ProfileReview - Address data:", profileData?.address)
  console.log("ProfileReview - Bank data:", profileData?.bank)
  console.log("ProfileReview - Document data:", profileData?.document)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitProfileForReview()
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        await onSubmit()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit profile",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderBusinessDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Business Details</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit("business")}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Legal Entity Name</p>
            <p className="text-sm">{profileData.business?.legalEntityName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Trade Name</p>
            <p className="text-sm">{profileData.business?.tradeName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">GSTIN</p>
            <p className="text-sm font-mono">{profileData.business?.gstin || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Business Entity Type</p>
            <p className="text-sm">{profileData.business?.businessEntityType || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Country</p>
            <p className="text-sm">{profileData.business?.country || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">State</p>
            <p className="text-sm">{profileData.business?.state || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">City</p>
            <p className="text-sm">{profileData.business?.city || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pincode</p>
            <p className="text-sm">{profileData.business?.pincode || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContactDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">Contact Details</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit("contact")}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
            <p className="text-sm">{profileData.contact?.contactName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email ID</p>
            <p className="text-sm">{profileData.contact?.emailId || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
            <p className="text-sm">{profileData.contact?.phoneNumber || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Preferred Pickup Time</p>
            <p className="text-sm">{profileData.contact?.pickupTime || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCategoryDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">Category & Brand Details</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit("category")}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Selected Categories</p>
          {profileData.category?.categories && profileData.category.categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.category.categories.map((category: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No categories selected</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Authorized Brands</p>
          {profileData.category?.authorizedBrands && profileData.category.authorizedBrands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.category.authorizedBrands.map((brand: string, index: number) => (
                <Badge key={index} variant="outline">
                  {brand}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No brands selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderAddressDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg">Address Details</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit("addresses")}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
                 <div>
           <p className="text-sm font-medium text-muted-foreground mb-2">Billing Address</p>
           <div className="bg-gray-50 p-3 rounded-md">
             <p className="text-sm">
               {profileData.address?.billingAddress?.addressLine1 || "Not provided"}
             </p>
             {profileData.address?.billingAddress?.addressLine2 && (
               <p className="text-sm">{profileData.address.billingAddress.addressLine2}</p>
             )}
             <p className="text-sm">
               {profileData.address?.billingAddress?.city && profileData.address?.billingAddress?.state && (
                 `${profileData.address.billingAddress.city}, ${profileData.address.billingAddress.state}`
               )}
             </p>
             <p className="text-sm">
               {profileData.address?.billingAddress?.phoneNumber && (
                 `Phone: ${profileData.address.billingAddress.phoneNumber}`
               )}
             </p>
           </div>
         </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Pickup Address</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm">
              {profileData.address?.pickupAddress?.addressLine1 || "Not provided"}
            </p>
            {profileData.address?.pickupAddress?.addressLine2 && (
              <p className="text-sm">{profileData.address.pickupAddress.addressLine2}</p>
            )}
                         <p className="text-sm">
               {profileData.address?.pickupAddress?.city && profileData.address?.pickupAddress?.state && (
                 `${profileData.address.pickupAddress.city}, ${profileData.address.pickupAddress.state}`
               )}
             </p>
             <p className="text-sm">
               {profileData.address?.pickupAddress?.phoneNumber && (
                 `Phone: ${profileData.address.pickupAddress.phoneNumber}`
               )}
             </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBankDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg">Bank Details</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit("bank")}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Account Holder Name</p>
            <p className="text-sm">{profileData.bank?.accountHolderName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Account Number</p>
            <p className="text-sm font-mono">{profileData.bank?.accountNumber || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
            <p className="text-sm">{profileData.bank?.bankName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">IFSC Code</p>
            <p className="text-sm font-mono">{profileData.bank?.ifscCode || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Branch</p>
            <p className="text-sm">{profileData.bank?.branch || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Account Type</p>
            <p className="text-sm">{profileData.bank?.accountType || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDocumentDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileImage className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg">Document Details</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit("documents")}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">PAN Card</p>
            <p className="text-sm">
              {profileData.document?.panCardUrl && 
               profileData.document.panCardUrl !== "placeholder-pancard-url" &&
               profileData.document.panCardUrl !== "pancard-uploaded-placeholder" ? (
                <span className="text-green-600">✓ Uploaded</span>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Aadhar Card</p>
            <p className="text-sm">
              {profileData.document?.aadharCardUrl && 
               profileData.document.aadharCardUrl !== "placeholder-aadharcard-url" &&
               profileData.document.aadharCardUrl !== "aadharcard-uploaded-placeholder" ? (
                <span className="text-green-600">✓ Uploaded</span>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold">Review Your Profile</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Please review all your details before final submission. You can edit any section by clicking the 'Edit' button.
        </p>
      </div>

      <div className="space-y-6">
        {renderBusinessDetails()}
        {renderContactDetails()}
        {renderCategoryDetails()}
        {renderAddressDetails()}
        {renderBankDetails()}
        {renderDocumentDetails()}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Profile for Review
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
