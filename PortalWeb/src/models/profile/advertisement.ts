import { Schema, type Document } from "mongoose"

export interface IAdvertisement extends Document {
  title?: string // Made optional
  subtitle?: string // Made optional
  description?: string // Made optional
  imageUrl?: string
  imageData?: string // Base64 encoded image data
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all"
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: {
      type: String,
      required: false, // Explicitly set to false
      default: "", // Allow empty string
      maxlength: 100,
    },
    subtitle: {
      type: String,
      required: false, // Explicitly set to false
      default: "", // Allow empty string
      maxlength: 150,
    },
    description: {
      type: String,
      required: false, // Explicitly set to false
      default: "", // Allow empty string
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imageData: {
      type: String, // Base64 encoded image data
      default: "",
    },
    linkUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },
    deviceType: {
      type: String,
      enum: ["all", "desktop", "mobile", "tablet"],
      default: "all",
    },
    position: {
      type: String,
      enum: ["homepage", "category", "bottomofhomepage", "cart", "wishlist", "all"],
      default: "all",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Add validation to ensure at least one image source is provided
AdvertisementSchema.pre("save", function (next) {
  if (!this.imageUrl && !this.imageData) {
    next(new Error("Either imageUrl or imageData must be provided"))
  } else {
    next()
  }
})

export default AdvertisementSchema
