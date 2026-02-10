import mongoose from "mongoose"

const subCategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sub_categories: [subCategorySchema],
  },
  { timestamps: true },
)

// Prevent duplicate model error in development with hot reloading
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)

export default Category
