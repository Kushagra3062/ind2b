import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { connectDB1 } from "@/lib/db"
import mongoose from "mongoose"

// Define interfaces for our data
interface Business {
  userId: string
  legalEntityName?: string
  tradeName?: string
  gstin?: string // Add gstin to the Business interface
  businessCountry?: string
  pincode?: string
  state?: string
  city?: string
  businessEntityType?: string
  createdAt?: string | Date
  [key: string]: any // For other properties
}

interface Contact {
  userId: string
  name?: string
  emailId?: string
  phoneNumber?: string
  pickupTime?: string
  [key: string]: any // For other properties
}

interface ProfileProgress {
  userId: string
  completedSteps: string[]
  currentStep: string
  status: "Approved" | "Reject" | "Review"
}

// Add User interface for lightweight sellers
interface User {
  _id: string
  name: string
  email: string
  type: "admin" | "seller" | "customer"
  onboardingStatus: "pending" | "light_completed" | "full_completed"
  lightOnboardingData?: {
    businessName: string
    gstNumber: string
    address: string
    categories: string[]
  }
  createdAt: Date
  updatedAt: Date
}

interface ContactMap {
  [userId: string]: Contact
}

interface ProgressMap {
  [userId: string]: ProfileProgress
}

interface UserMap {
  [userId: string]: User
}

export async function GET() {
  try {
    console.log("Fetching sellers from profile database and user database")
    
    // Connect to both databases
    const profileDb = await connectProfileDB()
    const userDb = await connectDB1()

    // Get models from profile database
    const BusinessSchema = new mongoose.Schema({}, { strict: false })
    const Business = profileDb.models.Business || profileDb.model("Business", BusinessSchema)

    const ContactSchema = new mongoose.Schema({}, { strict: false })
    const Contact = profileDb.models.Contact || profileDb.model("Contact", ContactSchema)

    // Get the ProfileProgress model
    const ProfileProgressSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, index: true },
        completedSteps: [{ type: String, required: true }],
        currentStep: { type: String, required: true },
        status: {
          type: String,
          enum: ["Approved", "Reject", "Review"],
          default: "Review", // Default status
        },
      },
      { timestamps: true },
    )
    const ProfileProgress = profileDb.models.ProfileProgress || profileDb.model("ProfileProgress", ProfileProgressSchema)

    // Get User model from user database
    const UserSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        type: { type: String, enum: ["admin", "seller", "customer"], default: "customer" },
        gstNumber: { type: String },
        onboardingStatus: { type: String, enum: ["pending", "light_completed", "full_completed"], default: "pending" },
        lightOnboardingData: {
          businessName: { type: String },
          gstNumber: { type: String },
          address: { type: String },
          categories: [{ type: String }],
        },
      },
      { timestamps: true },
    )
    const User = userDb.models.User || userDb.model("User", UserSchema)

    // Fetch all businesses
    const businesses = (await Business.find({}).lean()) as unknown as Business[]
    console.log(`Found ${businesses.length} businesses`)

    // Fetch all contacts
    const contacts = (await Contact.find({}).lean()) as unknown as Contact[]
    console.log(`Found ${contacts.length} contacts`)

    // Fetch all profile progresses
    const progresses = (await ProfileProgress.find({}).lean()) as unknown as ProfileProgress[]
    console.log(`Found ${progresses.length} profile progresses`)

    // Fetch lightweight sellers (users with light_completed status)
    const lightweightUsers = (await User.find({ 
      type: "seller", 
      onboardingStatus: "light_completed" 
    }).lean()) as unknown as User[]
    console.log(`Found ${lightweightUsers.length} lightweight sellers`)

    // Create a map of contacts by userId for quick lookup
    const contactsByUserId = contacts.reduce((acc: ContactMap, contact: Contact) => {
      if (contact.userId) {
        acc[contact.userId] = contact
      }
      return acc
    }, {})

    // Create a map of profile progresses by userId for quick lookup
    const progressesByUserId = progresses.reduce((acc: ProgressMap, progress: ProfileProgress) => {
      if (progress.userId) {
        acc[progress.userId] = progress
      }
      return acc
    }, {})

    const usersByUserId = lightweightUsers.reduce((acc: UserMap, user: User) => {
      acc[user._id] = user
      return acc
    }, {})

    // Combine business, contact, and profile progress data (full sellers)
    const fullSellers = businesses.map((business: Business) => {
      const contact = contactsByUserId[business.userId] || {}
      const progress = progressesByUserId[business.userId] || { status: "Review" }

      return {
        _id: business.userId,
        id: business.gstin || "",
        name: business.legalEntityName || "",
        tradeName: business.tradeName || "",
        email: contact.emailId || "",
        phone: contact.phoneNumber || "",
        registeredDate: business.createdAt ? new Date(business.createdAt).toLocaleDateString() : "",
        status: progress.status || "Review",
        type: "full" // Mark as full seller
      }
    })

    // Create lightweight sellers from User records
    const lightweightSellers = lightweightUsers.map((user: User) => {
      const progress = progressesByUserId[user._id] || { status: "Review" }
      
      return {
        _id: user._id,
        id: user.lightOnboardingData?.gstNumber || "",
        name: user.lightOnboardingData?.businessName || user.name,
        tradeName: user.lightOnboardingData?.businessName || user.name,
        email: user.email,
        phone: "", // No phone for lightweight sellers
        registeredDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
        status: "Pending Completion", // Lightweight sellers have pending completion status
        type: "light" // Mark as lightweight seller
      }
    })

    // Combine both types of sellers
    const allSellers = [...fullSellers, ...lightweightSellers]
    console.log(`Total sellers: ${allSellers.length} (${fullSellers.length} full + ${lightweightSellers.length} lightweight)`)

    return NextResponse.json(allSellers)
  } catch (error) {
    console.error("Error fetching sellers:", error)
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const values = await request.json()

    // Connect to the PROFILE_DB database
    const db = await connectProfileDB()

    // Define Business schema
    const BusinessSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, index: true },
        legalEntityName: { type: String, required: true },
        tradeName: { type: String, required: true },
        gstin: { type: String, required: true },
        businessCountry: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        businessEntityType: { type: String, required: true },
      },
      { timestamps: true },
    )

    // Get the Business model
    const Business = db.models.Business || db.model("Business", BusinessSchema)

    // Generate a unique user ID
    const userId = `0000${Math.floor(Math.random() * 10000)}`.slice(-5)

    // Create a new business record
    const newBusiness = new Business({
      userId: userId,
      legalEntityName: values.legalEntityName,
      tradeName: values.tradeName,
      gstin: values.gstin,
      businessCountry: values.businessCountry,
      pincode: values.pincode,
      state: values.state,
      city: values.city,
      businessEntityType: values.businessEntityType,
    })

    // Save the new business record to the database
    await newBusiness.save()

    // Also create contact record if we have contact information
    if (values.name || values.emailId || values.phoneNumber) {
      const ContactSchema = new mongoose.Schema(
        {
          userId: { type: String, required: true, index: true },
          name: { type: String },
          emailId: { type: String },
          phoneNumber: { type: String },
          pickupTime: { type: String },
        },
        { timestamps: true },
      )

      const Contact = db.models.Contact || db.model("Contact", ContactSchema)

      const newContact = new Contact({
        userId: userId,
        name: values.name,
        emailId: values.emailId,
        phoneNumber: values.phoneNumber,
        pickupTime: values.pickupTime,
      })

      await newContact.save()
    }

    // Create initial profile progress record
    const ProfileProgressSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, index: true },
        completedSteps: [{ type: String, required: true }],
        currentStep: { type: String, required: true },
        status: {
          type: String,
          enum: ["Approved", "Reject", "Review"],
          default: "Review",
        },
      },
      { timestamps: true },
    )

    const ProfileProgress = db.models.ProfileProgress || db.model("ProfileProgress", ProfileProgressSchema)

    const newProgress = new ProfileProgress({
      userId: userId,
      completedSteps: ["business"],
      currentStep: "contact",
      status: "Review",
    })

    await newProgress.save()

    return NextResponse.json({
      message: "Seller created successfully",
      sellerId: userId,
      gstin: values.gstin,
    })
  } catch (error) {
    console.error("Error creating seller:", error)
    return NextResponse.json({ error: "Failed to create seller" }, { status: 500 })
  }
}
