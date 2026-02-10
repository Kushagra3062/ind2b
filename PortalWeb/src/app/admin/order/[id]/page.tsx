import OrderDetail from "@/components/admin/order/OrderDetail"
import { use } from "react"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)

  return <OrderDetail orderId={id} />
}
