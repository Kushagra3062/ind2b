import type { Metadata } from "next"
import QuotationRequests from "@/components/seller/quotation-requests"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Quotation Requests - Seller Dashboard",
  description: "Manage and respond to customer quotation requests",
}

export default function QuotationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Quotation Requests</h1>
        <p className="text-gray-600">Manage and respond to customer quotation requests for your products</p>
      </div>

      <QuotationRequests />
    </div>
  )
}
