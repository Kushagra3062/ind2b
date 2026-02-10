import mongoose, { Schema } from "mongoose"

export interface IBank {
  userId: string
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branch: string
  city: string
  accountType: string
  bankLetterUrl: string
  createdAt: Date
  updatedAt: Date
}

const BankSchema = new Schema<IBank>(
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

export const Bank = mongoose.models.Bank || mongoose.model<IBank>("Bank", BankSchema)
