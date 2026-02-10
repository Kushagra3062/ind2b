export interface ReviewStats {
  total: number
  pending: number
  approved: number
  flagged: number
  totalGrowth: number
  pendingGrowth: number
  approvedGrowth: number
  flaggedGrowth: number
}

export interface Review {
  _id: string
  id: string
  productName: string
  sku: string
  company: string
  rating: number
  text: string
  date: string
  imageUrl: string
  // Keeping the original fields for compatibility
  image?: string
  buyerName?: string
  review?: string
  sellerName?: string
  status?: "Pending" | "Approved" | "Flagged"
}

export interface Product {
  _id: string
  product_id: number
  title: string
  image_link?: string
  seller_name: string
  status?: "Pending" | "Approved" | "Flagged"
  created_at?: string
}

// Adding the missing types
export interface RatingStats {
  total: number
  average: number
  growth: number
  distribution: number[]
}

export interface ProductDetails {
  name: string
  sku: string
  category: string
  pricePerUnit: number
  availableStock: number
  description: string
  imageUrl: string
}

export interface ProductMetrics {
  totalSales: {
    value: number
    growth: number
  }
  revenue: {
    value: number
    growth: number
  }
  conversionRate: {
    value: number
    growth: number
  }
  totalViews: {
    value: number
    growth: number
  }
  averageReview: {
    value: number
    distribution: number[]
  }
}

// Adding the missing rating distribution component
export interface RatingDistribution {
  distribution: number[]
}
