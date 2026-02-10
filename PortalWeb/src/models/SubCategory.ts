import mongoose from "mongoose"

export interface SubCategory {
  sub_category_id: number
  category_id: number
  sub_category_name: string
  created_at?: string
}

export const subCategorySchema = new mongoose.Schema<SubCategory>({
  sub_category_id: { type: Number, required: true },
  category_id: { type: Number, required: true },
  sub_category_name: { type: String, required: true },
  created_at: { type: String },
})

// Export the model
const SubCategoryModel = mongoose.models.SubCategory || mongoose.model<SubCategory>("SubCategory", subCategorySchema)

export default SubCategoryModel
