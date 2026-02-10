import { type Document, Schema } from "mongoose"
import { connectDB1 } from "@/lib/db"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  type: "admin" | "seller" | "customer"
  gstNumber?: string
  onboardingStatus?: "pending" | "light_completed" | "full_completed"
  lightOnboardingData?: {
  businessName: string
  gstNumber: string
  address: string
  categories: string[] 
  }
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "customer",
    },
    gstNumber: {
      type: String,
    },
    onboardingStatus: {
      type: String,
      enum: ["pending", "light_completed", "full_completed"],
      default: "pending",
    },
    lightOnboardingData: {
      businessName: { type: String },
      gstNumber: { type: String },
      address: { type: String },
      categories: [{ type: String }], 
    },
  },
  {
    timestamps: true,
  },
)

export async function getUserModel() {
  const connection = await connectDB1()
  return connection.models.User || connection.model<IUser>("User", userSchema)
}
