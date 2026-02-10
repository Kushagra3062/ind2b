import mongoose, { Schema } from "mongoose"

export interface IBusinessDetails {
  userId: string
  legalEntityName: string
  tradeName: string
  gstin: string
  country: string
  pincode: string
  state: string
  city: string
  businessEntityType: string
  createdAt: Date
  updatedAt: Date
}

const BusinessSchema = new Schema<IBusinessDetails>(
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

export const Business = mongoose.models.Business || mongoose.model<IBusinessDetails>("Business", BusinessSchema)
