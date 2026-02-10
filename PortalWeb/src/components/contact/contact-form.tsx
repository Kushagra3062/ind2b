"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { sendContactEmail } from "@/actions/contact"
import { Mail, Phone, User, MessageSquare, CheckCircle } from "lucide-react"

interface FormData {
  name: string
  email: string
  phone: string
  queryType: string
  orderId: string
  message: string
}

const queryTypes = [
  { value: "general-inquiry", label: "General Inquiry" },
  { value: "order-issue", label: "Order Issue" },
  { value: "product", label: "Product Question" },
  { value: "technical-support", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "return-refund", label: "Return & Refund" },
  { value: "partnership", label: "Partnership Inquiry" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
]

export default function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    queryType: "",
    orderId: "",
    message: "",
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.queryType || !formData.message) {
      toast.error("Please fill in all required fields")
      return
    }

    startTransition(async () => {
      try {
        const result = await sendContactEmail({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          queryType: formData.queryType,
          orderId: formData.orderId,
          message: formData.message,
        })

        if (result.success) {
          setIsSubmitted(true)
          toast.success("Message sent successfully! Our team will get back to you soon.")
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            queryType: "",
            orderId: "",
            message: "",
          })
        } else {
          toast.error(result.error || "Failed to send message. Please try again.")
        }
      } catch (error) {
        console.error("Contact form error:", error)
        toast.error("An unexpected error occurred. Please try again.")
      }
    })
  }

  const showOrderId =
    formData.queryType === "order-issue" || formData.queryType === "return-refund" || formData.queryType === "billing"

  if (isSubmitted) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
            <p className="text-gray-600 mb-6">Thank you for contacting us. Our team will get back to you soon.</p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="border-[#FF5C00] text-[#FF5C00] hover:bg-[#FF5C00] hover:text-white"
            >
              Send Another Message
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Send us a Message</CardTitle>
        <CardDescription className="text-gray-600">
          Fill out the form below and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-transparent"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-transparent"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-transparent"
            />
          </div>

          {/* Query Type Field */}
          <div className="space-y-2">
            <Label htmlFor="queryType" className="text-sm font-medium text-gray-700">
              Query Type *
            </Label>
            <Select
              value={formData.queryType}
              onValueChange={(value) => handleInputChange("queryType", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full focus:ring-2 focus:ring-[#FF5C00] focus:border-transparent">
                <SelectValue placeholder="Select your query type" />
              </SelectTrigger>
              <SelectContent>
                {queryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Order ID Field */}
          {showOrderId && (
            <div className="space-y-2">
              <Label htmlFor="orderId" className="text-sm font-medium text-gray-700">
                Order ID
              </Label>
              <Input
                id="orderId"
                type="text"
                placeholder="Enter your order ID (if applicable)"
                value={formData.orderId}
                onChange={(e) => handleInputChange("orderId", e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-transparent"
              />
            </div>
          )}

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your query in detail..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              required
              disabled={isPending}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5C00] focus:border-transparent resize-vertical"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FF5C00] hover:bg-[#E54A00] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Message...
              </div>
            ) : (
              "Send Message"
            )}
          </Button>

          {/* Privacy Notice */}
          <Alert>
            <AlertDescription className="text-xs text-gray-500">
              By submitting this form, you agree to our privacy policy. * Required fields. We typically respond within
              2-4 business hours during weekdays.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  )
}
