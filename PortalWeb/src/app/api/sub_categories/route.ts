import { connectDB2 } from "@/lib/db"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

interface SubCategory {
  sub_category_id: number
  category_id: number
  sub_category_name: string
  created_at?: string
}

const subCategorySchema = new mongoose.Schema<SubCategory>({
  sub_category_id: { type: Number, required: true },
  category_id: { type: Number, required: true },
  sub_category_name: { type: String, required: true },
  created_at: { type: String },
})

const SubCategoryModel = mongoose.models.SubCategory || mongoose.model<SubCategory>("SubCategory", subCategorySchema)

export async function GET() {
  try {
    await connectDB2()
    const subCategories = await SubCategoryModel.find().lean()
    return NextResponse.json(subCategories, { status: 200 })
  } catch (error) {
    console.error("Error fetching sub_categories:", error)
    return NextResponse.json({ error: "Error fetching sub_categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB2()
    const subCategoryData = await request.json()
    const newSubCategory = new SubCategoryModel(subCategoryData)
    await newSubCategory.save()
    return NextResponse.json(newSubCategory, { status: 201 })
  } catch (error) {
    console.error("Error posting sub_category:", error)
    return NextResponse.json({ error: "Error posting sub_category" }, { status: 500 })
  }
}
