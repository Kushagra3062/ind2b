export interface Seller {
  id: string
  name: string
  email: string
  address: string
  registeredDate: Date
  totalSales: string
  status: "Approved" | "Pending" | "Rejected"
}

export interface SellerFormData {
  legalEntityName: string
  tradeName: string
  gstin: string
  businessCountry: string
  pincode: string
  state: string
  city: string
  businessEntityType: string
  name: string
  phoneNumber: string
  emailId: string
  pickupTime: string
  category: string
  brandRequired: string
  billingCountry: string
  billingState: string
  billingCity: string
  billingAddressLine1: string
  billingAddressLine2: string
  billingAddressLine3: string
  pickupCountry: string
  pickupState: string
  pickupCity: string
  pickupAddressLine1: string
  pickupAddressLine2: string
  pickupAddressLine3: string
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  bankCity: string
  accountType: string
}
