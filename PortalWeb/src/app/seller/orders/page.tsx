import { OrderManagement } from "@/components/seller/orders/order-management"

export const dynamic = "force-dynamic"

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <OrderManagement />
    </div>
  )
}
