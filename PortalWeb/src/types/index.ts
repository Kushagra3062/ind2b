export interface Product {
  image_link: string
  title: string
  rating: number
  reviewCount?: number
  totalRatings?: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  _id: string
  id: string
  name: string
  productName: string
  category: string
  description: string
  skuCode: string
  stock: number
  price: number
  status: boolean
  image?: string
  weight: string
  length: string
  width: string
  breadth: string
  availableQuantity: string
  pricePerUnit: string
  discount?: number
  discountType: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  originalPrice: number
  seller_id: number
  units: string
}

export type CategoryType = "All" | "Electronics" | "Clothing" | "Home & Kitchen" | "Books" | string

export interface ProductFormData {
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  image_link?: string
  stock: number
  price: number
  discount?: number
  SKU: string
  seller_name: string
  location: string
  category_name: string
  sub_category_name?: string
  is_draft?: boolean
}
