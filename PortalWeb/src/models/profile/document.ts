import mongoose, { Schema } from "mongoose"

export interface IDocument {
  userId: string
  panCardUrl: string
  aadharCardUrl: string
  gstinUrl: string
  bankLetterUrl: string
  bankStatementUrl: string
  corporationCertificateUrl: string
  businessAddressUrl: string
  pickupAddressProofUrl: string
  signatureUrl: string
  balanceSheet2223Url: string
  balanceSheet2324Url: string
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
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

export const Document = mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema)
