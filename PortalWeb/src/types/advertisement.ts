// Create a shared Advertisement interface
export interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string // Make this optional to accommodate both use cases
  imageData?: string // Base64 encoded image data
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "all"
  startDate?: string
  endDate?: string
}
