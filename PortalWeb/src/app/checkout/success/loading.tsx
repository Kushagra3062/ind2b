import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
      <h2 className="mt-4 text-lg font-medium">Loading order details...</h2>
    </div>
  )
}
