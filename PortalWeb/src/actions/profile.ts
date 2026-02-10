"use server"

import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"
import { getUserModel } from "@/models/user"
import { revalidatePath } from "next/cache"
import type { TabType } from "@/types/profile"
import {
  BusinessSchema,
  ContactSchema,
  CategoryBrandSchema,
  AddressSchema,
  BankSchema,
  DocumentSchema,
  ProfileProgressSchema,
} from "@/lib/profileDb"

// Helper to get the next tab in sequence
const TAB_ORDER: TabType[] = ["business", "contact", "category", "addresses", "bank", "documents"]

function getNextTab(currentTab: TabType): TabType | null {
  const currentIndex = TAB_ORDER.indexOf(currentTab)
  if (currentIndex < 0 || currentIndex >= TAB_ORDER.length - 1) return null
  return TAB_ORDER[currentIndex + 1]
}

// Helper to serialize MongoDB documents
function serializeDocument(doc: any): any {
  if (!doc) return null

  // Handle Date objects
  if (doc instanceof Date) {
    return doc.toISOString()
  }

  // Handle ObjectId
  if (doc._id && typeof doc._id === "object" && doc._id.toString) {
    return { ...doc, _id: doc._id.toString() }
  }

  // Handle Mongoose documents
  if (doc.toObject) {
    const plainObj = doc.toObject({ getters: true, virtuals: true })
    return JSON.parse(JSON.stringify(plainObj))
  }

  // Handle objects with _doc property (Mongoose internals)
  if (doc._doc) {
    return JSON.parse(JSON.stringify(doc._doc))
  }

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item))
  }

  // Handle plain objects
  if (typeof doc === "object" && doc !== null) {
    const serialized: Record<string, any> = {}
    for (const [key, value] of Object.entries(doc)) {
      serialized[key] = serializeDocument(value)
    }
    return serialized
  }

  // Return primitive values as is
  return doc
}

// Helper function to safely find one document
async function safelyFindOne(model: any, query: any) {
  try {
    return await model.findOne(query).exec()
  } catch (error) {
    console.error(`Error finding document: ${error}`)
    return null
  }
}

// Initialize or get profile progress
export async function getProfileProgress() {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()
    const ProfileProgress = db.model("ProfileProgress")

    let progress = await safelyFindOne(ProfileProgress, { userId: user.id })

    if (!progress) {
      progress = await ProfileProgress.create({
        userId: user.id,
        completedSteps: [],
        currentStep: "business",
      })
    }

    // Ensure data is properly serialized
    const serializedProgress = {
      completedSteps: progress.completedSteps,
      currentStep: progress.currentStep,
    }

    // Convert to plain JSON
    const safeProgress = JSON.parse(JSON.stringify(serializedProgress))

    return {
      success: true,
      progress: safeProgress,
    }
  } catch (error) {
    console.error("Error in getProfileProgress:", error)
    return { error: "Failed to get profile progress" }
  }
}

// Update profile progress
async function updateProfileProgress(userId: string, completedStep: TabType) {
  try {
    console.log(`Updating progress for user ${userId}, completed step: ${completedStep}`)
    const db = await connectProfileDB()
    const ProfileProgress = db.model("ProfileProgress")

    const progress = await safelyFindOne(ProfileProgress, { userId })
    const nextStep = getNextTab(completedStep)
    console.log(`Next step determined: ${nextStep}`)

    if (progress) {
      console.log("Existing progress found, updating")
      // Create a new array with the completed step if it's not already included
      const updatedSteps = progress.completedSteps.includes(completedStep)
        ? progress.completedSteps
        : [...progress.completedSteps, completedStep]

      // Update the document with the new array and next step
      await ProfileProgress.findByIdAndUpdate(progress._id, {
        completedSteps: updatedSteps,
        currentStep: nextStep || completedStep,
      })

      console.log("Progress saved successfully")
    } else {
      console.log("No existing progress, creating new record")
      await ProfileProgress.create({
        userId,
        completedSteps: [completedStep],
        currentStep: nextStep || completedStep,
      })
      console.log("New progress record created")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateProfileProgress:", error)
    return { error: "Failed to update profile progress" }
  }
}

// Save business details
export async function saveBusinessDetails(formData: FormData) {
  try {
    console.log("Starting saveBusinessDetails server action")
    const user = await getCurrentUser()
    console.log("Current user:", user)
    if (!user) {
      console.log("No authenticated user found")
      return { error: "Not authenticated" }
    }
    console.log("User ID:", user.id)

    console.log("Connecting to profile DB")
    const db = await connectProfileDB()
    const Business = db.model("Business")

    const businessData = {
      userId: user.id,
      legalEntityName: formData.get("legalEntityName") as string,
      tradeName: formData.get("tradeName") as string,
      gstin: formData.get("gstin") as string,
      country: formData.get("country") as string,
      pincode: formData.get("pincode") as string,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      businessEntityType: formData.get("businessEntityType") as string,
    }

    console.log("Business data to save:", businessData)

    // Check if business details already exist for this user
    const existingBusiness = await safelyFindOne(Business, { userId: user.id })
    console.log("Existing business record:", existingBusiness)

    if (existingBusiness) {
      console.log("Updating existing business record")
      const updatedBusiness = await Business.findByIdAndUpdate(existingBusiness._id, businessData, { new: true })
      console.log("Updated business record:", updatedBusiness)
    } else {
      console.log("Creating new business record")
      const newBusiness = await Business.create(businessData)
      console.log("Created business record:", newBusiness)
    }

    // Update progress
    console.log("Updating progress")
    await updateProfileProgress(user.id, "business")

    console.log("Revalidating path")
    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Business details saved successfully",
    }
  } catch (error) {
    console.error("Error in saveBusinessDetails:", error)
    return { error: "Failed to save business details" }
  }
}

// Save contact details
export async function saveContactDetails(formData: FormData) {
  try {
    console.log("Starting saveContactDetails server action")
    const user = await getCurrentUser()
    console.log("Current user:", user)
    if (!user) {
      console.log("No authenticated user found")
      return { error: "Not authenticated" }
    }
    console.log("User ID:", user.id)

    console.log("Connecting to profile DB")
    const db = await connectProfileDB()
    const Contact = db.model("Contact")

    const contactData = {
      userId: user.id,
      contactName: formData.get("contactName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      emailId: formData.get("emailId") as string,
      pickupTime: formData.get("pickupTime") as string,
    }

    console.log("Contact data to save:", contactData)

    // Check if contact details already exist for this user
    const existingContact = await safelyFindOne(Contact, { userId: user.id })
    console.log("Existing contact record:", existingContact)

    if (existingContact) {
      console.log("Updating existing contact record")
      const updatedContact = await Contact.findByIdAndUpdate(existingContact._id, contactData, { new: true })
      console.log("Updated contact record:", updatedContact)
    } else {
      console.log("Creating new contact record")
      const newContact = await Contact.create(contactData)
      console.log("Created contact record:", newContact)
    }

    // Update progress
    console.log("Updating progress")
    await updateProfileProgress(user.id, "contact")

    console.log("Revalidating path")
    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Contact details saved successfully",
    }
  } catch (error) {
    console.error("Error in saveContactDetails:", error)
    return { error: "Failed to save contact details" }
  }
}

// Save category and brand details
export async function saveCategoryAndBrand(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()
    const CategoryBrand = db.model("CategoryBrand")

    // FormData can have multiple values with the same name
    const categories = formData.getAll("categories") as string[]
    const authorizedBrands = formData.getAll("authorizedBrands") as string[]

    const categoryData = {
      userId: user.id,
      categories,
      authorizedBrands,
    }

    // Check if category details already exist for this user
    const existingCategory = await safelyFindOne(CategoryBrand, { userId: user.id })

    if (existingCategory) {
      // Update existing record
      await CategoryBrand.findByIdAndUpdate(existingCategory._id, categoryData)
    } else {
      // Create new record
      await CategoryBrand.create(categoryData)
    }

    // Update progress
    await updateProfileProgress(user.id, "category")

    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Category and brand details saved successfully",
    }
  } catch (error) {
    console.error("Error in saveCategoryAndBrand:", error)
    return { error: "Failed to save category and brand details" }
  }
}

// Save address details
export async function saveAddressDetails(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()
    const Address = db.model("Address")

    const addressData = {
      userId: user.id,
      billingAddress: {
        country: formData.get("billingAddress.country") as string,
        state: formData.get("billingAddress.state") as string,
        city: formData.get("billingAddress.city") as string,
        addressLine1: formData.get("billingAddress.addressLine1") as string,
        addressLine2: (formData.get("billingAddress.addressLine2") as string) || "",
        phoneNumber: formData.get("billingAddress.phoneNumber") as string,
      },
      pickupAddress: {
        country: formData.get("pickupAddress.country") as string,
        state: formData.get("pickupAddress.state") as string,
        city: formData.get("pickupAddress.city") as string,
        addressLine1: formData.get("pickupAddress.addressLine1") as string,
        addressLine2: (formData.get("pickupAddress.addressLine2") as string) || "",
        phoneNumber: formData.get("pickupAddress.phoneNumber") as string,
      },
    }

    // Check if address details already exist for this user
    const existingAddress = await safelyFindOne(Address, { userId: user.id })

    if (existingAddress) {
      // Update existing record
      await Address.findByIdAndUpdate(existingAddress._id, addressData)
    } else {
      // Create new record
      await Address.create(addressData)
    }

    // Update progress
    await updateProfileProgress(user.id, "addresses")

    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Address details saved successfully",
    }
  } catch (error) {
    console.error("Error in saveAddressDetails:", error)
    return { error: "Failed to save address details" }
  }
}

// Save bank details
export async function saveBankDetails(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()
    const Bank = db.model("Bank")

    // Handle file upload - in a real app, you would upload to a storage service
    // and store the URL in the database
    const bankLetterUrl = formData.get("bankLetterUrl")
    let bankLetterUrlString = "placeholder-bank-letter-url" // Default placeholder

    // Check if bankLetterUrl is a string or a File object
    if (bankLetterUrl) {
      if (typeof bankLetterUrl === "string") {
        bankLetterUrlString = bankLetterUrl
      } else {
        // If it's a File object, in a real app you would upload it
        bankLetterUrlString = "file-uploaded-placeholder"
      }
    }

    const bankData = {
      userId: user.id,
      accountHolderName: formData.get("accountHolderName") as string,
      accountNumber: formData.get("accountNumber") as string,
      ifscCode: formData.get("ifscCode") as string,
      bankName: formData.get("bankName") as string,
      branch: formData.get("branch") as string,
      city: formData.get("city") as string,
      accountType: formData.get("accountType") as string,
      bankLetterUrl: bankLetterUrlString, // Using placeholder
      isVerified: false,
    }

    // Check if bank details already exist for this user
    const existingBank = await safelyFindOne(Bank, { userId: user.id })

    if (existingBank) {
      // Update existing record
      await Bank.findByIdAndUpdate(existingBank._id, bankData)
    } else {
      // Create new record
      await Bank.create(bankData)
    }

    // Update progress
    await updateProfileProgress(user.id, "bank")

    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Bank details saved successfully",
    }
  } catch (error) {
    console.error("Error in saveBankDetails:", error)
    return { error: "Failed to save bank details" }
  }
}

// Save document details only (without completing profile)
export async function saveDocuments(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Not authenticated", redirect: false }

    const db = await connectProfileDB()
    const Document = db.model("Document")
    const ProfileProgress = db.model("ProfileProgress")

    // Get data from formData
    const panCard = formData.get("panCard")
    const aadharCard = formData.get("aadharCard")

    // Handle file uploads - convert to strings if they're File objects
    let panCardUrl = "placeholder-pancard-url" // Default placeholder
    let aadharCardUrl = "placeholder-aadharcard-url" // Default placeholder

    if (panCard) {
      if (typeof panCard === "string") {
        panCardUrl = panCard
      } else {
        // If it's a File object, in a real app you would upload it
        panCardUrl = "pancard-uploaded-placeholder"
      }
    }

    if (aadharCard) {
      if (typeof aadharCard === "string") {
        aadharCardUrl = aadharCard
      } else {
        // If it's a File object, in a real app you would upload it
        aadharCardUrl = "aadharcard-uploaded-placeholder"
      }
    }

    // Create a document with all required fields
    const documentData = {
      userId: user.id,
      panCardUrl,
      aadharCardUrl,
      // Add all required fields with placeholder values
      gstinUrl: "placeholder-gstin-url",
      bankLetterUrl: "placeholder-bank-letter-url",
      bankStatementUrl: "placeholder-bank-statement-url",
      corporationCertificateUrl: "placeholder-corporation-certificate-url",
      businessAddressUrl: "placeholder-business-address-url",
      pickupAddressProofUrl: "placeholder-pickup-address-proof-url",
      signatureUrl: "placeholder-signature-url",
      balanceSheet2223Url: "placeholder-balance-sheet-2223-url",
      balanceSheet2324Url: "placeholder-balance-sheet-2324-url",
      updatedAt: new Date(),
    }

    // Check if document details already exist for this user
    const existingDocument = await safelyFindOne(Document, { userId: user.id })

    if (existingDocument) {
      // Update existing record
      await Document.findByIdAndUpdate(existingDocument._id, documentData)
    } else {
      // Create new record
      await Document.create({
        ...documentData,
        createdAt: new Date(),
      })
    }

    // Update progress to mark documents as completed
    const progress = await safelyFindOne(ProfileProgress, { userId: user.id })
    if (progress) {
      const updatedSteps = [...new Set([...progress.completedSteps, "documents"])]
      await ProfileProgress.findByIdAndUpdate(progress._id, {
        completedSteps: updatedSteps,
        currentStep: "review",
      })
    } else {
      await ProfileProgress.create({
        userId: user.id,
        completedSteps: ["documents"],
        currentStep: "review",
      })
    }

    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Documents saved successfully",
      redirect: false,
    }
  } catch (error) {
    console.error("Error in saveDocuments:", error)
    return { success: false, message: "Failed to save documents", redirect: false }
  }
}

// Final profile submission action
export async function submitProfileForReview() {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()
    const ProfileProgress = db.model("ProfileProgress")

    // Update the profile status to "Review"
    const progress = await safelyFindOne(ProfileProgress, { userId: user.id })
    if (progress) {
      await ProfileProgress.findByIdAndUpdate(progress._id, {
        status: "Review", 
        submittedAt: new Date(),
      })
    }

    // Update user's onboarding status to "full_completed"
    const UserModel = await getUserModel()
    await UserModel.findByIdAndUpdate(user.id, {
      onboardingStatus: "full_completed"
    })

    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Profile submitted for review successfully",
    }
  } catch (error) {
    console.error("Error in submitProfileForReview:", error)
    return { error: "Failed to submit profile for review" }
  }
}

// Save document details and complete profile
export async function saveDocumentsAndComplete(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Not authenticated", redirect: false }

    const db = await connectProfileDB()
    const Document = db.model("Document")
    const ProfileProgress = db.model("ProfileProgress")

    // Get data from formData
    const panCard = formData.get("panCard")
    const aadharCard = formData.get("aadharCard")

    // Handle file uploads - convert to strings if they're File objects
    let panCardUrl = "placeholder-pancard-url" // Default placeholder
    let aadharCardUrl = "placeholder-aadharcard-url" // Default placeholder

    if (panCard) {
      if (typeof panCard === "string") {
        panCardUrl = panCard
      } else {
        // If it's a File object, in a real app you would upload it
        panCardUrl = "pancard-uploaded-placeholder"
      }
    }

    if (aadharCard) {
      if (typeof aadharCard === "string") {
        aadharCardUrl = aadharCard
      } else {
        // If it's a File object, in a real app you would upload it
        aadharCardUrl = "aadharcard-uploaded-placeholder"
      }
    }

    // Create a document with all required fields
    const documentData = {
      userId: user.id,
      panCardUrl,
      aadharCardUrl,
      // Add all required fields with placeholder values
      gstinUrl: "placeholder-gstin-url",
      bankLetterUrl: "placeholder-bank-letter-url",
      bankStatementUrl: "placeholder-bank-statement-url",
      corporationCertificateUrl: "placeholder-corporation-certificate-url",
      businessAddressUrl: "placeholder-business-address-url",
      pickupAddressProofUrl: "placeholder-pickup-address-proof-url",
      signatureUrl: "placeholder-signature-url",
      balanceSheet2223Url: "placeholder-balance-sheet-2223-url",
      balanceSheet2324Url: "placeholder-balance-sheet-2324-url",
      updatedAt: new Date(),
    }

    // Check if document details already exist for this user
    const existingDocument = await safelyFindOne(Document, { userId: user.id })

    if (existingDocument) {
      // Update existing record
      await Document.findByIdAndUpdate(existingDocument._id, documentData)
    } else {
      // Create new record
      await Document.create({
        ...documentData,
        createdAt: new Date(),
      })
    }

    // Mark all steps as completed and change status to "Review"
    const progress = await safelyFindOne(ProfileProgress, { userId: user.id })
    if (progress) {
      await ProfileProgress.findByIdAndUpdate(progress._id, {
        completedSteps: TAB_ORDER,
        currentStep: "documents",
        status: "Review", 
        isCompleted: true,
      })
    } else {
      await ProfileProgress.create({
        userId: user.id,
        completedSteps: TAB_ORDER,
        currentStep: "documents",
        status: "Review", 
        isCompleted: true,
      })
    }

    // Update user's onboarding status to "full_completed"
    const UserModel = await getUserModel()
    await UserModel.findByIdAndUpdate(user.id, {
      onboardingStatus: "full_completed"
    })

    revalidatePath("/seller/profile")

    return {
      success: true,
      message: "Profile completed successfully",
      redirect: true,
    }
  } catch (error) {
    console.error("Error in saveDocumentsAndComplete:", error)
    return { success: false, message: "Failed to complete profile", redirect: false }
  }
}







// Get all profile data for a user
export async function getProfileData() {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()

    // Safely get models with error handling
    let Business, Contact, CategoryBrand, Address, Bank, Document, ProfileProgress

    try {
      // Try to get models, or register them if they don't exist
      try {
        Business = db.model("Business")
      } catch (e) {
        Business = db.model("Business", BusinessSchema)
      }

      try {
        Contact = db.model("Contact")
      } catch (e) {
        Contact = db.model("Contact", ContactSchema)
      }

      try {
        CategoryBrand = db.model("CategoryBrand")
      } catch (e) {
        CategoryBrand = db.model("CategoryBrand", CategoryBrandSchema)
      }

      try {
        Address = db.model("Address")
      } catch (e) {
        Address = db.model("Address", AddressSchema)
      }

      try {
        Bank = db.model("Bank")
      } catch (e) {
        Bank = db.model("Bank", BankSchema)
      }

      try {
        Document = db.model("Document")
      } catch (e) {
        Document = db.model("Document", DocumentSchema)
      }

      try {
        ProfileProgress = db.model("ProfileProgress")
      } catch (e) {
        ProfileProgress = db.model("ProfileProgress", ProfileProgressSchema)
      }
    } catch (error) {
      console.error("Error getting models:", error)
      return { error: "Failed to access profile models. Please try again." }
    }

    // Fix the TypeScript error with findOne by using our helper function
    const business = await safelyFindOne(Business, { userId: user.id })
    const contact = await safelyFindOne(Contact, { userId: user.id })
    const category = await safelyFindOne(CategoryBrand, { userId: user.id })
    const address = await safelyFindOne(Address, { userId: user.id })
    const bank = await safelyFindOne(Bank, { userId: user.id })
    const document = await safelyFindOne(Document, { userId: user.id })
    const progress = await safelyFindOne(ProfileProgress, { userId: user.id })

    // Debug: Log the raw data from database
    console.log("getProfileData - Raw business data:", business)
    console.log("getProfileData - Raw contact data:", contact)
    console.log("getProfileData - Raw category data:", category)
    console.log("getProfileData - Raw address data:", address)
    console.log("getProfileData - Raw bank data:", bank)
    console.log("getProfileData - Raw document data:", document)
    
    // Debug: Check if data exists
    console.log("getProfileData - Business exists:", !!business)
    console.log("getProfileData - Contact exists:", !!contact)
    console.log("getProfileData - Category exists:", !!category)
    console.log("getProfileData - Address exists:", !!address)
    console.log("getProfileData - Bank exists:", !!bank)
    console.log("getProfileData - Document exists:", !!document)

    // Ensure all data is properly serialized
    const serializedData = {
      business: serializeDocument(business),
      contact: serializeDocument(contact),
      category: serializeDocument(category),
      address: serializeDocument(address),
      bank: serializeDocument(bank),
      document: serializeDocument(document),
      progress: progress
        ? {
            completedSteps: progress.completedSteps,
            currentStep: progress.currentStep || "business", // Ensure currentStep is included
          }
        : {
            completedSteps: [],
            currentStep: "business",
          },
    }

    // Debug: Log the serialized data
    console.log("getProfileData - Serialized business:", serializedData.business)
    console.log("getProfileData - Serialized contact:", serializedData.contact)
    console.log("getProfileData - Serialized category:", serializedData.category)
    console.log("getProfileData - Serialized address:", serializedData.address)
    console.log("getProfileData - Serialized bank:", serializedData.bank)
    console.log("getProfileData - Serialized document:", serializedData.document)

    // Convert to plain JSON to ensure no methods are passed
    const safeData = JSON.parse(JSON.stringify(serializedData))

    // Debug: Log the final safe data
    console.log("getProfileData - Final safe data:", safeData)

    return {
      success: true,
      data: safeData,
    }
  } catch (error) {
    console.error("Error in getProfileData:", error)
    return { error: "Failed to get profile data" }
  }
}

// Test function to create sample data for debugging
export async function createTestData() {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "Not authenticated" }

    const db = await connectProfileDB()
    
    // Create sample business data
    const Business = db.model("Business")
    const businessData = {
      userId: user.id,
      legalEntityName: "Test Company Ltd",
      tradeName: "Test Trade",
      gstin: "22AAAAA0000A1Z5",
      country: "India",
      pincode: "123456",
      state: "Maharashtra",
      city: "Mumbai",
      businessEntityType: "Private Limited",
    }
    
    // Create sample contact data
    const Contact = db.model("Contact")
    const contactData = {
      userId: user.id,
      contactName: "John Doe",
      phoneNumber: "9876543210",
      emailId: "john@test.com",
      pickupTime: "9:00 AM - 6:00 PM",
    }
    
    // Create sample category data
    const CategoryBrand = db.model("CategoryBrand")
    const categoryData = {
      userId: user.id,
      categories: ["Electronics", "Home & Garden"],
      authorizedBrands: ["Samsung", "LG"],
    }
    
    // Create sample address data
    const Address = db.model("Address")
    const addressData = {
      userId: user.id,
      billingAddress: {
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        addressLine1: "123 Test Street",
        addressLine2: "Test Building",
        phoneNumber: "9876543210",
      },
      pickupAddress: {
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        addressLine1: "456 Pickup Street",
        addressLine2: "Pickup Building",
        phoneNumber: "9876543210",
      },
    }
    
    // Create sample bank data
    const Bank = db.model("Bank")
    const bankData = {
      userId: user.id,
      accountHolderName: "John Doe",
      accountNumber: "1234567890",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India",
      branch: "Mumbai Main",
      city: "Mumbai",
      accountType: "Savings",
      bankLetterUrl: "test-bank-letter-url",
    }
    
    // Create sample document data
    const Document = db.model("Document")
    const documentData = {
      userId: user.id,
      panCardUrl: "test-pancard-url",
      aadharCardUrl: "test-aadharcard-url",
      gstinUrl: "test-gstin-url",
      bankLetterUrl: "test-bank-letter-url",
      bankStatementUrl: "test-bank-statement-url",
      corporationCertificateUrl: "test-corporation-url",
      businessAddressUrl: "test-business-address-url",
      pickupAddressProofUrl: "test-pickup-address-url",
      signatureUrl: "test-signature-url",
      balanceSheet2223Url: "test-balance-sheet-22-23-url",
      balanceSheet2324Url: "test-balance-sheet-23-24-url",
    }
    
    // Save all test data
    await Business.findOneAndUpdate({ userId: user.id }, businessData, { upsert: true })
    await Contact.findOneAndUpdate({ userId: user.id }, contactData, { upsert: true })
    await CategoryBrand.findOneAndUpdate({ userId: user.id }, categoryData, { upsert: true })
    await Address.findOneAndUpdate({ userId: user.id }, addressData, { upsert: true })
    await Bank.findOneAndUpdate({ userId: user.id }, bankData, { upsert: true })
    await Document.findOneAndUpdate({ userId: user.id }, documentData, { upsert: true })
    
    console.log("Test data created successfully")
    
    return {
      success: true,
      message: "Test data created successfully",
    }
  } catch (error) {
    console.error("Error creating test data:", error)
    return { error: "Failed to create test data" }
  }
}
