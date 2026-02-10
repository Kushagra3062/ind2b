"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import RequestQuoteForm from "./request-quote-form"

interface RequestQuoteButtonProps {
  productId: string
  productTitle: string
  sellerId: string
  currentPrice: number
}

export default function RequestQuoteButton({
  productId,
  productTitle,
  sellerId,
  currentPrice,
}: RequestQuoteButtonProps) {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <RequestQuoteForm
        productId={productId}
        productTitle={productTitle}
        sellerId={sellerId}
        currentPrice={currentPrice}
        onClose={() => setShowForm(false)}
      />
    )
  }

  return (
    <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
      <MessageSquare className="w-4 h-4 mr-2" />
      Request Quote
    </Button>
  )
}
