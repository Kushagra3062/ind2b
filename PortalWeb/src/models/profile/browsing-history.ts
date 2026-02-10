import { Schema, type Document, type Connection } from "mongoose"

export interface IBrowsingHistory extends Document {
  userId: string
  productId: string
  title?: string
  image?: string
  category?: string
  viewedAt: Date
}

const browsingHistorySchema = new Schema<IBrowsingHistory>(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    title: { type: String },
    image: { type: String },
    category: { type: String },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    strict: true,
    collection: "browsing_history",
  },
)

// Limit one entry per user/product per day by unique compound index on userId+productId+date
browsingHistorySchema.index({ userId: 1, productId: 1, viewedAt: -1 })

export default function getBrowsingHistoryModel(connection: Connection) {
  try {
    return connection.model<IBrowsingHistory>("BrowsingHistory")
  } catch (_err) {
    return connection.model<IBrowsingHistory>("BrowsingHistory", browsingHistorySchema)
  }
}
