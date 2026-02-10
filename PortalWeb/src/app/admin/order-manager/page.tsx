import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Order Manager",
  description: "Comprehensive order management system for administrators",
}

export default function OrderManagerPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Manager</h1>
      </div>

      {/* Use dynamic import to avoid hydration issues */}
      <div className="mt-6">
       
        <OrderManagerContent />
      </div>
    </div>
  )
}

// Separate the dashboard into a client component that's loaded dynamically
import { OrderManagerDashboard } from "@/components/admin/order-manager/dashboard"

function OrderManagerContent() {
  return <OrderManagerDashboard />
}
