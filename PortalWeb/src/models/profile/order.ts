import mongoose from "mongoose"

// Define the order schema with both fields for compatibility
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: [
      {
        productId: { type: String, required: true }, // Keep existing field for compatibility
        product_id: { type: String, required: true }, // Make this required too
        seller_id: { type: String, required: true }, // Ensure this is required
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image_link: String,
      },
    ],
    billingDetails: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    totalAmount: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    warehouseSelected: { type: Boolean, default: false },
    warehouseId: String,
    logisticsSelected: { type: Boolean, default: false },
    logisticsId: String,
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentDetails: {
      paymentId: String,
      orderId: String,
      signature: String,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "pending",
        "PROCESSING",
        "processing",
        "SHIPPED",
        "shipped",
        "DELIVERED",
        "delivered",
        "CANCELLED",
        "cancelled",
      ],
      default: "PENDING",
    },
    additionalNotes: String,
  },
  { timestamps: true },
)

// Add compound indexes for efficient seller-based queries
orderSchema.index({ "products.seller_id": 1, createdAt: -1 })
orderSchema.index({ userId: 1, "products.seller_id": 1 })

// Remove duplicate index definitions by removing index: true from schema fields
// Index is already defined above

export default orderSchema

// Define TypeScript interfaces for the order
export interface OrderProduct {
  //productId: string // Keep existing field
  product_id: string // Add new field as optional
  seller_id: string
  title: string
  quantity: number
  price: number
  image_link?: string
}

export interface BillingDetails {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface PaymentDetails {
  paymentId?: string
  orderId?: string
  signature?: string
}

export interface Order {
  _id?: string
  userId: string
  products: OrderProduct[]
  billingDetails?: BillingDetails
  totalAmount: number
  subTotal: number
  discount?: number
  tax?: number
  warehouseSelected?: boolean
  warehouseId?: string
  logisticsSelected?: boolean
  logisticsId?: string
  paymentMethod: "COD" | "ONLINE"
  paymentDetails?: PaymentDetails
  status?:
    | "PENDING"
    | "pending"
    | "PROCESSING"
    | "processing"
    | "SHIPPED"
    | "shipped"
    | "DELIVERED"
    | "delivered"
    | "CANCELLED"
    | "cancelled"
  additionalNotes?: string
  createdAt?: Date
  updatedAt?: Date
}
