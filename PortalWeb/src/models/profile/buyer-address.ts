import mongoose, { Schema, type Document } from "mongoose"

export interface IBuyerAddress extends Document {
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

const BuyerAddressSchema = new Schema<IBuyerAddress>(
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
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

// Index for faster queries
BuyerAddressSchema.index({ userId: 1, createdAt: -1 })
BuyerAddressSchema.index({ userId: 1, isDefault: 1 })

export const BuyerAddress =
  mongoose.models.BuyerAddress || mongoose.model<IBuyerAddress>("BuyerAddress", BuyerAddressSchema)
