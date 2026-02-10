import mongoose, { type Connection } from "mongoose"
import type { IBusinessDetails } from "@/models/profile/business"
import type { IContactDetails } from "@/models/profile/contact"
import type { IAddress } from "@/models/profile/address"
import type { IBank } from "@/models/profile/bank"
import type { IDocument } from "@/models/profile/document"
import type { IProfileProgress } from "@/models/profile/progress"

const PROFILE_DB =
  process.env.PROFILE_DB ||
  process.env.MONGODB_URI ||
  "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Validate connection string exists during build
if (!PROFILE_DB && process.env.NODE_ENV === "production") {
  console.warn("Warning: PROFILE_DB and MONGODB_URI environment variables are not set. Using fallback URI.")
}

// Define the interface locally to avoid import issues
interface ICategoryBrand {
  userId: string
  categories: string[]
  authorizedBrands: string[]
}

// Advertisement interface
interface IAdvertisement {
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all"
  startDate?: Date
  endDate?: Date
}

// PromotionSettings interface for managing promotion section
interface IPromotionSettings {
  videoId: string
  bannerImageUrl?: string
  bannerImageData?: string
  isActive: boolean
  updatedAt: Date
}

// Review interface with complete order items
interface IReview {
  orderId: string
  userId: string
  product_id: string
  rating: number
  review: string
  status: "pending" | "approved" | "rejected"
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

// Feedback interface
interface IFeedback {
  name: string
  email: string
  category: string
  message: string
  emoji: number
  vibeLabel: string
  vibeValue: string
  createdAt: Date
  updatedAt: Date
}

// Message interface for contact form
interface IMessage {
  name: string
  email: string
  phone?: string
  queryType: string
  orderId?: string
  message: string
  status: "new" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: Date
  updatedAt: Date
}

// WhatsApp Campaign interface
interface IWhatsAppCampaign {
  title: string
  description: string
  messageTemplate: string
  targetAudience: "all" | "customers" | "sellers" | "custom"
  customerSegment?: {
    orderHistory?: "has_orders" | "no_orders" | "recent_orders"
    location?: string[]
    registrationDate?: {
      from?: Date
      to?: Date
    }
  }
  scheduledAt?: Date
  status: "draft" | "scheduled" | "sent" | "cancelled"
  sentCount: number
  deliveredCount: number
  failedCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// WhatsApp Campaign Log interface
interface IWhatsAppCampaignLog {
  campaignId: string
  recipientPhone: string
  recipientName: string
  recipientEmail?: string
  messageContent: string
  status: "pending" | "sent" | "delivered" | "failed"
  twilioSid?: string
  errorMessage?: string
  sentAt?: Date
  deliveredAt?: Date
  createdAt: Date
}

// Customer Preferences interface
interface ICustomerPreferences {
  userId: string
  whatsappMarketing: boolean
  emailMarketing: boolean
  smsMarketing: boolean
  productUpdates: boolean
  offerNotifications: boolean
  orderUpdates: boolean
  createdAt: Date
  updatedAt: Date
}

// Coupon interface for discount management
interface ICoupon {
  couponName: string
  couponCode: string
  discountType: "percentage" | "fixed"
  discountValue: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  usageLimit?: number
  usedCount: number
  minOrderValue?: number
  maxDiscountAmount?: number
  createdAt: Date
  updatedAt: Date
}

interface ICareer {
  title: string
  type: "full-time" | "part-time" | "internship" | "contract"
  location: string
  isRemote: boolean
  description: string
  responsibilities: string[]
  requirements: string[]
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  applyUrl?: string
  applyEmail?: string
  isActive: boolean
  applicationDeadline?: Date
  createdAt: Date
  updatedAt: Date
}

// BuyerAddress interface
interface IBuyerAddress {
  userId: string
  firstName: string
  lastName: string
  companyName?: string
  address: string
  country: string
  state: string
  city: string
  zipCode: string
  email: string
  phoneNumber: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Cache the database connection
let cachedConnection: Connection | null = null
let connectionPromise: Promise<Connection> | null = null

export async function connectProfileDB(): Promise<Connection> {
  // If we already have a connection, return it
  if (cachedConnection) {
    console.log("Using existing profile database connection")
    return cachedConnection
  }

  // If we're already connecting, return the promise
  if (connectionPromise) {
    console.log("Reusing profile database connection promise")
    return connectionPromise
  }

  console.log("Creating new profile database connection")
  console.log("Connecting to PROFILE_DB:", PROFILE_DB)

  // Create a new connection promise with increased timeouts
  connectionPromise = mongoose
    .createConnection(PROFILE_DB, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      connectTimeoutMS: 60000,
      dbName: "test", // Explicitly specify the database name
    })
    .asPromise()
    .then((conn) => {
      console.log("Profile database connected successfully")
      // Add null check for conn.db
      if (conn.db) {
        console.log("Connected to database:", conn.db.databaseName)
      } else {
        console.log("Database connection established but db instance is undefined")
      }
      cachedConnection = conn
      // Register models with the connection
      registerModels(conn)
      console.log("Models registered:", Object.keys(conn.models))
      return conn
    })
    .catch((error) => {
      console.error("Profile database connection error:", error)
      connectionPromise = null
      throw error
    })

  return connectionPromise
}

export async function disconnectProfileDB() {
  if (cachedConnection) {
    await cachedConnection.close()
    cachedConnection = null
  }
}

// Define schemas
const BusinessSchema = new mongoose.Schema<IBusinessDetails>(
  {
    userId: { type: String, required: true, index: true },
    legalEntityName: { type: String, required: true },
    tradeName: { type: String, required: true },
    gstin: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    businessEntityType: { type: String, required: true },
  },
  { timestamps: true },
)

const ContactSchema = new mongoose.Schema<IContactDetails>(
  {
    userId: { type: String, required: true, index: true },
    contactName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailId: { type: String, required: true },
    pickupTime: { type: String, required: true },
  },
  { timestamps: true },
)

const CategoryBrandSchema = new mongoose.Schema<ICategoryBrand>(
  {
    userId: { type: String, required: true, index: true },
    categories: [{ type: String, required: true }],
    authorizedBrands: [{ type: String, required: true }],
  },
  { timestamps: true },
)

const AddressSchema = new mongoose.Schema<IAddress>(
  {
    userId: { type: String, required: true, index: true },
    billingAddress: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      phoneNumber: { type: String, required: true },
    },
    pickupAddress: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      phoneNumber: { type: String, required: true },
    },
  },
  { timestamps: true },
)

const BankSchema = new mongoose.Schema<IBank>(
  {
    userId: { type: String, required: true, index: true },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    branch: { type: String, required: true },
    city: { type: String, required: true },
    accountType: { type: String, required: true },
    bankLetterUrl: { type: String, required: true },
  },
  { timestamps: true },
)

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    userId: { type: String, required: true, index: true },
    panCardUrl: { type: String, required: true },
    aadharCardUrl: { type: String, required: true },
    gstinUrl: { type: String, required: true },
    bankLetterUrl: { type: String, required: true },
    bankStatementUrl: { type: String, required: true },
    corporationCertificateUrl: { type: String, required: true },
    businessAddressUrl: { type: String, required: true },
    pickupAddressProofUrl: { type: String, required: true },
    signatureUrl: { type: String, required: true },
    balanceSheet2223Url: { type: String, required: true },
    balanceSheet2324Url: { type: String, required: true },
  },
  { timestamps: true },
)

const ProfileProgressSchema = new mongoose.Schema<IProfileProgress>(
  {
    userId: { type: String, required: true, index: true },
    completedSteps: [{ type: String, required: true }],
    currentStep: { type: String, required: true },
    status: {
      type: String,
      enum: ["Approved", "Reject", "Review", "Pending Completion"],
      default: "Pending Completion",
    },
  },
  { timestamps: true },
)

// Enhanced Product schema with commission fields - REMOVED MIDDLEWARE
const ProductSchema = new mongoose.Schema(
  {
    product_id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    model: String,
    description: String,
    category_id: Number,
    sub_category_id: Number,
    units: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    image_link: String,
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: Number,
    SKU: { type: String, required: true },
    seller_id: String,
    emailId: { type: String, required: true },
    location: { type: String, required: true },
    category_name: { type: String, required: true },
    sub_category_name: String,
    is_draft: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Flagged"],
      default: "Pending",
    },
    // Commission fields
    commission: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    commission_type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    commission_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    final_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    // Disable automatic middleware to prevent conflicts
    minimize: false,
    versionKey: false,
  },
)

// Add indexes for efficient querying
ProductSchema.index({ product_id: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ commission: 1 })
ProductSchema.index({ emailId: 1 })
ProductSchema.index({ created_at: -1 })
ProductSchema.index({ commission: 1, status: 1 })

// Define Order schema
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    products: [
      {
        productId: { type: String, required: true },
        seller_id: { type: String, required: true },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image_link: String,
      },
    ],
    billingDetails: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    totalAmount: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    warehouseSelected: { type: Boolean, default: false },
    warehouseId: String,
    logisticsSelected: { type: Boolean, default: false },
    logisticsId: String,
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentDetails: {
      paymentId: String,
      orderId: String,
      signature: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    additionalNotes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Define Cart schema
const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        image_link: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true },
        units: { type: String },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Define Wishlist schema
const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        image_link: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        units: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Define Advertisement schema - Make sure this matches your database structure
const AdvertisementSchema = new mongoose.Schema<IAdvertisement>(
  {
    title: { type: String, required: true, maxlength: 100 },
    subtitle: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 500 },
    imageUrl: { type: String }, // External URL (optional)
    imageData: { type: String }, // Base64 encoded image data (optional)
    linkUrl: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    deviceType: {
      type: String,
      enum: ["all", "desktop", "mobile", "tablet"],
      default: "all",
    },
    position: {
      type: String,
      enum: ["homepage", "category", "bottomofhomepage", "cart", "wishlist", "all"],
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "advertisements", // Explicitly specify collection name
  },
)

const PromotionSettingsSchema = new mongoose.Schema<IPromotionSettings>(
  {
    videoId: { type: String, required: true },
    bannerImageUrl: { type: String },
    bannerImageData: { type: String },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "promotionsettings",
  },
)

// Add indexes for efficient querying
PromotionSettingsSchema.index({ isActive: 1 })

// Review schema with enhanced orderItems structure
const ReviewSchema = new mongoose.Schema<IReview>(
  {
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    product_id: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews", // Explicitly specify collection name
  },
)

// Add indexes for efficient querying
ReviewSchema.index({ createdAt: -1 })
ReviewSchema.index({ rating: 1 })
ReviewSchema.index({ status: 1, createdAt: -1 })
ReviewSchema.index({ orderId: 1, userId: 1, product_id: 1 }, { unique: true }) // Prevent duplicate reviews

// Define BuyerAddress schema
const BuyerAddressSchema = new mongoose.Schema<IBuyerAddress>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "buyeraddresses",
  },
)

// Add indexes for BuyerAddress
BuyerAddressSchema.index({ userId: 1, createdAt: -1 })
BuyerAddressSchema.index({ userId: 1, isDefault: 1 })

// Define Feedback schema
const FeedbackSchema = new mongoose.Schema<IFeedback>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    category: {
      type: String,
      required: true,
      enum: ["General Feedback", "Bug Report", "Feature Request", "Design/UI", "Performance", "Other"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    emoji: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    vibeLabel: {
      type: String,
      required: true,
      enum: ["Sad", "Meh", "Happy", "Lit", "Slay", "Shook"],
    },
    vibeValue: {
      type: String,
      required: true,
      enum: ["Low", "Mid", "Good", "High", "Fire", "Surprised"],
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  },
)

// Add indexes for Feedback
FeedbackSchema.index({ createdAt: -1 })
FeedbackSchema.index({ category: 1 })
FeedbackSchema.index({ emoji: 1 })
FeedbackSchema.index({ email: 1, createdAt: -1 })

// Define Message schema for contact form
const MessageSchema = new mongoose.Schema<IMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    queryType: {
      type: String,
      required: true,
      enum: [
        "general",
        "order",
        "product",
        "technical",
        "billing",
        "return",
        "partnership",
        "other",
        "general-inquiry",
        "order-issue",
        "return-refund",
        "payment-issue",
        "seller-support",
        "technical-support",
        "feedback",
      ],
    },
    orderId: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "messages",
  },
)

// Add indexes for Message
MessageSchema.index({ createdAt: -1 })
MessageSchema.index({ status: 1, createdAt: -1 })
MessageSchema.index({ queryType: 1 })
MessageSchema.index({ email: 1, createdAt: -1 })
MessageSchema.index({ priority: 1, status: 1 })

// Define WhatsApp Campaign schema
const WhatsAppCampaignSchema = new mongoose.Schema<IWhatsAppCampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    messageTemplate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    targetAudience: {
      type: String,
      enum: ["all", "customers", "sellers", "custom"],
      required: true,
    },
    customerSegment: {
      orderHistory: {
        type: String,
        enum: ["has_orders", "no_orders", "recent_orders"],
      },
      location: [String],
      registrationDate: {
        from: Date,
        to: Date,
      },
    },
    scheduledAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "cancelled"],
      default: "draft",
      index: true,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "whatsappcampaigns",
  },
)

// Add indexes for WhatsApp Campaign
WhatsAppCampaignSchema.index({ status: 1, createdAt: -1 })
WhatsAppCampaignSchema.index({ scheduledAt: 1 })
WhatsAppCampaignSchema.index({ createdBy: 1, createdAt: -1 })
WhatsAppCampaignSchema.index({ targetAudience: 1 })

// Define WhatsApp Campaign Log schema
const WhatsAppCampaignLogSchema = new mongoose.Schema<IWhatsAppCampaignLog>(
  {
    campaignId: {
      type: String,
      required: true,
      index: true,
    },
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    messageContent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
      index: true,
    },
    twilioSid: {
      type: String,
      trim: true,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "whatsappcampaignlogs",
  },
)

// Add indexes for WhatsApp Campaign Log
WhatsAppCampaignLogSchema.index({ campaignId: 1, status: 1 })
WhatsAppCampaignLogSchema.index({ recipientPhone: 1 })
WhatsAppCampaignLogSchema.index({ status: 1, createdAt: -1 })
WhatsAppCampaignLogSchema.index({ sentAt: 1 })

// Define Customer Preferences schema
const CustomerPreferencesSchema = new mongoose.Schema<ICustomerPreferences>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    whatsappMarketing: {
      type: Boolean,
      default: true,
    },
    emailMarketing: {
      type: Boolean,
      default: true,
    },
    smsMarketing: {
      type: Boolean,
      default: false,
    },
    productUpdates: {
      type: Boolean,
      default: true,
    },
    offerNotifications: {
      type: Boolean,
      default: true,
    },
    orderUpdates: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "customerpreferences",
  },
)

// Add indexes for Customer Preferences
CustomerPreferencesSchema.index({ userId: 1 })
CustomerPreferencesSchema.index({ whatsappMarketing: 1 })

// Coupon schema for discount management
const CouponSchema = new mongoose.Schema<ICoupon>(
  {
    couponName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
      index: true,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "coupons",
  },
)

// Add indexes for Coupon
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 })
CouponSchema.index({ couponCode: 1, isActive: 1 })

const CareerSchema = new mongoose.Schema<ICareer>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    isRemote: {
      type: Boolean,
      default: false,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
    },
    salaryCurrency: {
      type: String,
      default: "INR",
      trim: true,
      maxlength: 10,
    },
    applyUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    applyEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "careers",
  },
)

CareerSchema.index({ isActive: 1, createdAt: -1 })
CareerSchema.index({ type: 1, isActive: 1 })
CareerSchema.index({ isRemote: 1, isActive: 1 })
CareerSchema.index({ applicationDeadline: 1 })

interface IApplicant {
  careerId: string
  careerTitle: string
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  education: string
  collegeName: string // Added collegeName field
  experience: string
  skills: string[]
  cvUrl: string
  coverLetter: string
  whyInterested: string
  linkedinUrl?: string
  portfolioUrl?: string
  availableFrom?: Date
  expectedSalary?: number
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired"
  appliedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ApplicantSchema = new mongoose.Schema<IApplicant>(
  {
    careerId: {
      type: String,
      required: true,
      index: true,
    },
    careerTitle: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    education: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    skills: {
      type: [String],
      required: true,
      default: [],
    },
    cvUrl: {
      type: String,
      required: true,
      trim: true,
    },
    coverLetter: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    whyInterested: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    availableFrom: {
      type: Date,
    },
    expectedSalary: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "applicants",
  },
)

ApplicantSchema.index({ careerId: 1, email: 1 }, { unique: true })
ApplicantSchema.index({ status: 1, appliedAt: -1 })
ApplicantSchema.index({ email: 1, appliedAt: -1 })
ApplicantSchema.index({ appliedAt: -1 })

// Define Newsletter Schema
interface INewsletter {
  email: string
  subscribedAt: Date
  unsubscribedAt?: Date
  isActive: boolean
}

const NewsletterSchema = new mongoose.Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "newsletter",
  },
)

// Add indexes for Newsletter
NewsletterSchema.index({ email: 1, isActive: 1 })
NewsletterSchema.index({ subscribedAt: -1 })

// Update the registerModels function to include all models
function registerModels(connection: Connection) {
  console.log("Registering models...")

  // Only register models if they don't already exist
  if (!connection.models.Business) {
    connection.model("Business", BusinessSchema)
    console.log("Registered Business model")
  }
  if (!connection.models.Contact) {
    connection.model("Contact", ContactSchema)
    console.log("Registered Contact model")
  }
  if (!connection.models.CategoryBrand) {
    connection.model("CategoryBrand", CategoryBrandSchema)
    console.log("Registered CategoryBrand model")
  }
  if (!connection.models.Address) {
    connection.model("Address", AddressSchema)
    console.log("Registered Address model")
  }
  if (!connection.models.Bank) {
    connection.model("Bank", BankSchema)
    console.log("Registered Bank model")
  }
  if (!connection.models.Document) {
    connection.model("Document", DocumentSchema)
    console.log("Registered Document model")
  }
  if (!connection.models.ProfileProgress) {
    connection.model("ProfileProgress", ProfileProgressSchema)
    console.log("Registered ProfileProgress model")
  }
  if (!connection.models.Product) {
    connection.model("Product", ProductSchema)
    console.log("Registered Product model")
  }
  if (!connection.models.Order) {
    connection.model("Order", OrderSchema)
    console.log("Registered Order model")
  }
  if (!connection.models.Cart) {
    connection.model("Cart", CartSchema)
    console.log("Registered Cart model")
  }
  if (!connection.models.Wishlist) {
    connection.model("Wishlist", WishlistSchema)
    console.log("Registered Wishlist model")
  }
  if (!connection.models.Advertisement) {
    connection.model("Advertisement", AdvertisementSchema)
    console.log("Registered Advertisement model")
  }
  if (!connection.models.Review) {
    connection.model("Review", ReviewSchema)
    console.log("Registered Review model")
  }
  if (!connection.models.BuyerAddress) {
    connection.model("BuyerAddress", BuyerAddressSchema)
    console.log("Registered BuyerAddress model")
  }
  if (!connection.models.Feedback) {
    connection.model("Feedback", FeedbackSchema)
    console.log("Registered Feedback model")
  }
  if (!connection.models.Message) {
    connection.model("Message", MessageSchema)
    console.log("Registered Message model")
  }
  if (!connection.models.WhatsAppCampaign) {
    connection.model("WhatsAppCampaign", WhatsAppCampaignSchema)
    console.log("Registered WhatsAppCampaign model")
  }
  if (!connection.models.WhatsAppCampaignLog) {
    connection.model("WhatsAppCampaignLog", WhatsAppCampaignLogSchema)
    console.log("Registered WhatsAppCampaignLog model")
  }
  if (!connection.models.CustomerPreferences) {
    connection.model("CustomerPreferences", CustomerPreferencesSchema)
    console.log("Registered CustomerPreferences model")
  }
  if (!connection.models.PromotionSettings) {
    connection.model("PromotionSettings", PromotionSettingsSchema)
    console.log("Registered PromotionSettings model")
  }
  if (!connection.models.Career) {
    connection.model("Career", CareerSchema)
    console.log("Registered Career model")
  }
  if (!connection.models.Applicant) {
    connection.model("Applicant", ApplicantSchema)
    console.log("Registered Applicant model")
  }
  if (!connection.models.Coupon) {
    connection.model("Coupon", CouponSchema)
    console.log("Registered Coupon model")
  }
  if (!connection.models.Newsletter) {
    connection.model("Newsletter", NewsletterSchema)
    console.log("Registered Newsletter model")
  }

  console.log("All models registered successfully")
}

// Export schemas for use in other files
export {
  BusinessSchema,
  ContactSchema,
  CategoryBrandSchema,
  AddressSchema,
  BankSchema,
  DocumentSchema,
  ProfileProgressSchema,
  ProductSchema,
  OrderSchema,
  CartSchema,
  WishlistSchema,
  AdvertisementSchema,
  ReviewSchema,
  BuyerAddressSchema,
  FeedbackSchema,
  MessageSchema,
  WhatsAppCampaignSchema,
  WhatsAppCampaignLogSchema,
  CustomerPreferencesSchema,
  PromotionSettingsSchema,
  CareerSchema,
  ApplicantSchema,
  CouponSchema,
  NewsletterSchema,
  PROFILE_DB,
}

// Create and export the database connection instance
let PROFILE_DB_CONNECTION: Connection | null = null

export const PROFILE_DB_CONNECTION_OBJ = {
  async collection(name: string) {
    if (!PROFILE_DB_CONNECTION) {
      PROFILE_DB_CONNECTION = await connectProfileDB()
    }
    return PROFILE_DB_CONNECTION.db?.collection(name)
  },
}
