import mongoose, { Schema } from "mongoose"

interface AddressDetail {
  country: string
  state: string
  city: string
  addressLine1: string
  addressLine2?: string
  phoneNumber: string
}

export interface IAddress {
  userId: string
  billingAddress: AddressDetail
  pickupAddress: AddressDetail
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>(
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

export const Address = mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema)
