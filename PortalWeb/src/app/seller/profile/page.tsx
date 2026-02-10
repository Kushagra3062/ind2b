"use client"

import { useState, useEffect, useCallback } from "react"
import { BusinessForm } from "@/components/seller/profiles/business-form"
import { ContactForm } from "@/components/seller/profiles/contact-form"
import { CategoryBrandForm } from "@/components/seller/profiles/category-brand-form"
import { AddressForm } from "@/components/seller/profiles/address-form"
import { BankForm } from "@/components/seller/profiles/bank-form"
import { DocumentForm } from "@/components/seller/profiles/document-form"
import { ProfileReview } from "@/components/seller/profiles/profile-review"

import { ProfileSuccess } from "@/components/seller/profiles/profile-success"

import type { TabType } from "@/types/profile"
import { Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const TAB_ORDER: TabType[] = ["business", "contact", "category", "addresses", "bank", "documents", "review"]

// Properly type the tabs array to ensure value is recognized as TabType
const tabs: { label: string; value: TabType }[] = [
  { label: "Business", value: "business" },
  { label: "Contact", value: "contact" },
  { label: "Category", value: "category" },
  { label: "Address", value: "addresses" },
  { label: "Bank", value: "bank" },
  { label: "Documents", value: "documents" },
  { label: "Review", value: "review" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("business")
  const [completedSteps, setCompletedSteps] = useState<TabType[]>([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  // Track the furthest step the user has reached
  const [furthestStep, setFurthestStep] = useState<number>(0)
  // Add a key to force re-render of forms when tab changes
  const [formKey, setFormKey] = useState(Date.now())

  // Function to check if a tab is completed
  const isTabCompleted = useCallback(
    (tab: TabType) => {
      return completedSteps.includes(tab)
    },
    [completedSteps],
  )

  // Function to check if a tab is enabled (can be clicked)
  const isTabEnabled = useCallback(
    (tab: TabType) => {
      const tabIndex = TAB_ORDER.indexOf(tab)
      return isTabCompleted(tab) || tabIndex <= furthestStep
    },
    [isTabCompleted, furthestStep],
  )

  // Use useCallback to prevent recreation of this function on every render
  const fetchProfileData = useCallback(async () => {
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
        console.log("Business data for form:", result.data.business)
        console.log("Contact data for form:", result.data.contact)
        setProfileData(result.data)

        // Check if result.data.progress exists before accessing its properties
        if (result.data.progress) {
          const completed = result.data.progress.completedSteps || []
          setCompletedSteps(completed)

          // Set the furthest step based on completed steps
          if (completed.length > 0) {
            const indices = completed.map((step: TabType) => TAB_ORDER.indexOf(step))
            const maxIndex = Math.max(...indices)
            setFurthestStep(Math.max(maxIndex + 1, furthestStep)) // Set to the next step after the furthest completed one
          }

          // Set the active tab based on the current step from the server
          if (result.data.progress.currentStep) {
            setActiveTab(result.data.progress.currentStep)
          }

          // Show success screen if all steps are completed
          if (completed.includes("documents")) {
            // Don't automatically show success, let user go to review first
            setFurthestStep(TAB_ORDER.length - 1) // Allow access to review step
          }
        }
      } else {
        console.error("API returned error:", result.error)
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }, [furthestStep])

  // Update furthestStep when a tab is clicked and refresh data
  const handleTabClick = useCallback(
    async (tab: TabType) => {
      if (isTabEnabled(tab)) {
        try {
          console.log("Tab clicked:", tab, "- refreshing data...")
          
          // Refresh data from the server before changing tabs
          await fetchProfileData()

          setActiveTab(tab)
          const tabIndex = TAB_ORDER.indexOf(tab)
          // Update furthestStep if the clicked tab is further than the current furthestStep
          setFurthestStep((prev) => Math.max(prev, tabIndex))

          // Scroll to top of the page when changing tabs
          window.scrollTo({ top: 0, behavior: 'smooth' })

          // Generate a new key to force re-render of the form component
          setFormKey(Date.now())
          console.log("Tab change - Form key updated to:", Date.now())
        } catch (error) {
          console.error("Error changing tabs:", error)
        }
      }
    },
    [isTabEnabled, fetchProfileData],
  )

  // Callback for when a form is successfully saved
  const handleFormSaved = useCallback(async () => {
    console.log("handleFormSaved called - refreshing data...")
    
    // Refresh the data from the server
    await fetchProfileData()

    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    setFormKey(Date.now())
    console.log("Form key updated to:", Date.now())
  }, [fetchProfileData, activeTab])

  // Fetch data on initial mount
  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  


  // Memoize renderForm to prevent unnecessary re-renders
  const renderForm = useCallback(() => {
    if (!profileData) return null

    console.log("Rendering form for tab:", activeTab)
    console.log("Profile data for this tab:", profileData[activeTab])
    console.log("Full profileData:", profileData)
    console.log("Form key:", formKey)

    switch (activeTab) {
      case "business":
        return <BusinessForm key={`business-${formKey}`} initialData={profileData.business} onSaved={handleFormSaved} isPrefilledData={profileData.isPrefilledData} />
      case "contact":
        return <ContactForm key={`contact-${formKey}`} initialData={profileData.contact} onSaved={handleFormSaved} />
      case "category":
        return (
          <CategoryBrandForm key={`category-${formKey}`} initialData={profileData.category} onSaved={handleFormSaved} isPrefilledData={profileData.isPrefilledData} />
        )
      case "addresses":
        return <AddressForm key={`addresses-${formKey}`} initialData={profileData.address} onSaved={handleFormSaved} isPrefilledData={profileData.isPrefilledData} />
      case "bank":
        return <BankForm key={`bank-${formKey}`} initialData={profileData.bank} onSaved={handleFormSaved} />
      case "documents":
        return (
          <DocumentForm
            key={`documents-${formKey}`}
            initialData={profileData.document}
            onSuccess={() => {
              handleFormSaved()
              // Note: handleFormSaved will automatically advance to the next tab (review)
              // and scroll to top, so we don't need to manually set the tab here
            }}
          />
        )
      case "review":
        console.log("Rendering review with profileData:", profileData)
        return (
          <ProfileReview
            key={`review-${formKey}`}
            profileData={profileData}
            onEdit={(tab) => setActiveTab(tab)}
            onSubmit={() => {
              setShowSuccess(true)
            }}
            onBack={() => setActiveTab("documents")}
          />
        )
      default:
        return null
    }
  }, [activeTab, profileData, formKey, handleFormSaved])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (showSuccess) {
    return <ProfileSuccess />
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Management</h1>
        <p className="text-muted-foreground">Update your business and personal information here.</p>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-2 md:space-x-4 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              disabled={!isTabEnabled(tab.value)}
              className={cn(
                "px-3 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                "border-b-2 -mb-px flex items-center gap-1",
                activeTab === tab.value ? "border-orange-600 text-orange-600" : "border-transparent",
                isTabEnabled(tab.value)
                  ? "hover:text-orange-600 text-muted-foreground"
                  : "opacity-50 cursor-not-allowed text-muted-foreground",
                isTabCompleted(tab.value) ? "text-green-600" : "",
              )}
            >
              {isTabCompleted(tab.value) && <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-2xl">{renderForm()}</div>
    </div>
  )
}
