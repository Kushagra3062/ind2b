import { connectDB2 } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

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
  discount?: number
  SKU: string
  seller_id?: number
  created_at?: string
  rating?: number
  updated_at?: string
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

const productSchema = new mongoose.Schema<Product>({
  product_id: { type: Number, required: true },
  title: { type: String, required: true },
  model: { type: String },
  description: { type: String },
  category_id: { type: Number },
  sub_category_id: { type: Number },
  units: { type: String },
  weight: { type: Number },
  dimensions: {
    width: { type: Number },
    height: { type: Number },
    length: { type: Number },
  },
  image_link: { type: String },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number },
  SKU: { type: String },
  seller_id: { type: Number },
  created_at: { type: String },
  updated_at: { type: String },
  rating: { type: Number },
  seller_name: { type: String },
  location: { type: String },
  category_name: { type: String },
  sub_category_name: { type: String },
})

const db2 = await connectDB2()

const ProductModel = db2.models.Product || db2.model<Product>("Product", productSchema)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value
    console.log(token)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string }
    const sellerId = decoded.userId

    const products = await ProductModel.aggregate([
      { $match: { seller_id: sellerId } },
      {
        $lookup: {
          from: "sellers",
          localField: "seller_id",
          foreignField: "seller_id",
          as: "seller",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "category_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "sub_category_id",
          foreignField: "sub_category_id",
          as: "sub_category",
        },
      },
      {
        $addFields: {
          seller_name: { $arrayElemAt: ["$seller.seller_name", 0] },
          location: { $arrayElemAt: ["$seller.location", 0] },
          category_name: { $arrayElemAt: ["$category.category_name", 0] },
          sub_category_name: { $arrayElemAt: ["$sub_category.sub_category_name", 0] },
        },
      },
      {
        $project: {
          seller: 0,
          category: 0,
          sub_category: 0,
        },
      },
    ])

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string }
    const sellerId = decoded.userId

    const body = await request.json()
    const newProduct = new ProductModel({
      ...body,
      seller_id: sellerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await newProduct.save()

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json({ error: "Error adding product" }, { status: 500 })
  }
}
