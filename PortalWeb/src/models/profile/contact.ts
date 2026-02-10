import mongoose, { Schema } from "mongoose"

export interface IContactDetails {
  userId: string
  contactName: string
  phoneNumber: string
  emailId: string
  pickupTime: string
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContactDetails>(
  {
    userId: { type: String, required: true, index: true },
    contactName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailId: { type: String, required: true },
    pickupTime: { type: String, required: true },
  },
  { timestamps: true },
)

export const Contact = mongoose.models.Contact || mongoose.model<IContactDetails>("Contact", ContactSchema)
