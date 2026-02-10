import type mongoose from "mongoose"
import { Schema } from "mongoose"

export interface IQuotationRequest {
  _id?: string
  productId: string
  productTitle: string
  sellerId: string
  userId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  requestedPrice: number
  message?: string
  status: "pending" | "responded" | "accepted" | "rejected"
  sellerResponse?: string
  sellerQuotedPrice?: number
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const QuotationRequestSchema = new Schema<IQuotationRequest>(
  {
    productId: { type: String, required: true, index: true },
    productTitle: { type: String, required: true },
    sellerId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    requestedPrice: { type: Number, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "responded", "accepted", "rejected"],
      default: "pending",
    },
    sellerResponse: { type: String },
    sellerQuotedPrice: { type: Number },
    rejectionReason: { type: String },
  },
  { timestamps: true },
)

// Create indexes for better query performance
QuotationRequestSchema.index({ sellerId: 1, createdAt: -1 })
QuotationRequestSchema.index({ productId: 1, createdAt: -1 })
QuotationRequestSchema.index({ userId: 1, createdAt: -1 })
QuotationRequestSchema.index({ status: 1, createdAt: -1 })

export default function getQuotationRequestModel(connection: mongoose.Connection) {
  return (
    connection.models.QuotationRequest ||
    connection.model<IQuotationRequest>("QuotationRequest", QuotationRequestSchema)
  )
}
