"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2, X } from "lucide-react"
import { toast } from "react-hot-toast"

interface RequestQuoteFormProps {
  productId: string
  productTitle: string
  sellerId: string
  currentPrice: number
  onClose: () => void
}

export default function RequestQuoteForm({
  productId,
  productTitle,
  sellerId,
  currentPrice,
  onClose,
}: RequestQuoteFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    requestedPrice: currentPrice,
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.requestedPrice <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/quotations/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productTitle,
          sellerId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Quotation request sent successfully!")
        onClose()
      } else {
        toast.error(result.error || "Failed to send quotation request")
      }
    } catch (error) {
      console.error("Error submitting quotation request:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-600" />
          Request Quote
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Product: <span className="font-medium">{productTitle}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerPhone: e.target.value }))}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedPrice">
              Your Quoted Price (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requestedPrice"
              type="number"
              min="1"
              value={formData.requestedPrice}
              onChange={(e) => setFormData((prev) => ({ ...prev, requestedPrice: Number(e.target.value) }))}
              placeholder="Enter your price"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Any additional requirements or message..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
