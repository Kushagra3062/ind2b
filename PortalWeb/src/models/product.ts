import mongoose from "mongoose"

interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: object
  image_link?: string
  stock: number
  price: number
  gst: number // GST percentage
  discount?: number
  SKU: string
  seller_id?: number
  created_at?: string
  rating?: number
  updated_at?: string
  seller_name?: string
  location?: string
  category_name?: string
  sub_category_name?: string
  status?: string
}

const productSchema = new mongoose.Schema({
  product_id: { type: Number, unique: true },
  title: { type: String, required: true },
  model: String,
  description: String,
  category_id: Number,
  sub_category_id: Number,
  units: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  image_link: String,
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  gst: { type: Number, required: true }, // GST percentage
  discount: Number,
  SKU: { type: String, required: true },
  seller_id: Number,
  created_at: { type: Date, default: Date.now },
  rating: Number,
  updated_at: { type: Date, default: Date.now },
  seller_name: { type: String, required: true },
  location: { type: String, required: true },
  category_name: { type: String, required: true },
  sub_category_name: String,
  is_draft: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ["Pending", "Approved", "Flagged"], default: "Pending" },
})

// Auto-increment product_id
productSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const Product = mongoose.model("Product")
      const lastProduct = await Product.findOne({}, {}, { sort: { product_id: -1 } })
      this.product_id = lastProduct ? lastProduct.product_id + 1 : 1
      next()
    } catch (error) {
      next(error as Error)
    }
  } else {
    next()
  }
})

const ProductModel = mongoose.models.Product || mongoose.model<Product>("Product", productSchema)

export { ProductModel }
