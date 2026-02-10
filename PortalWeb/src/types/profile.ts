export const ACCOUNT_TYPES = ["Savings", "Current"] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export type TabType = "business" | "contact" | "category" | "addresses" | "bank" | "documents" | "review"

export const TAB_ORDER: TabType[] = ["business", "contact", "category", "addresses", "bank", "documents", "review"]

// Add the missing category and brand constants
export const AVAILABLE_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Books",
  "Toys & Games",
  "Sports & Outdoors",
  "Automotive",
  "Health & Wellness",
  "Grocery & Gourmet Food",
] as const

export const AVAILABLE_BRANDS = [
  "Apple",
  "Samsung",
  "Sony",
  "Nike",
  "Adidas",
  "Puma",
  "H&M",
  "Zara",
  "IKEA",
  "Philips",
  "Bosch",
  "L'Oreal",
  "Maybelline",
  "Dove",
  "Penguin Books",
  "HarperCollins",
  "LEGO",
  "Mattel",
  "Wilson",
  "Spalding",
] as const

export interface CategoryAndBrand {
  // Fix: Add the missing properties
  categories: string[]
  authorizedBrands: string[]
  // Keep these for backward compatibility
  id?: string
  name?: string
  selected?: boolean
}

export interface BusinessDetails {
  legalEntityName: string
  tradeName: string
  gstin: string
  country: string
  pincode: string
  state: string
  city: string
  businessEntityType: string
}

export interface ContactDetails {
  contactName: string
  phoneNumber: string
  emailId: string
  pickupTime: string
}

export interface CategoryBrandDetails {
  categories: string[]
  authorizedBrands: string[]
}

export interface AddressDetails {
  billingAddress: {
    country: string
    state: string
    city: string
    addressLine1: string
    addressLine2?: string
    phoneNumber: string
  }
  pickupAddress: {
    country: string
    state: string
    city: string
    addressLine1: string
    addressLine2?: string
    phoneNumber: string
  }
}

export interface BankDetails {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branch: string
  city: string
  accountType: AccountType | undefined
  bankLetterFile?: File
}

export interface DocumentDetails {
  aadharCard?: string
  panCard?: string
}
