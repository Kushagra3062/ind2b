"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendContactEmail } from "@/actions/contact"

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    try {
      const result = await sendContactEmail(formData)
      if (result.success) {
        setSubmitted(true)
        setError("")
      } else {
        setError(result.error || "Failed to send message. Please try again.")
      }
    } catch (err) {
      console.error("Form submission error:", err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  if (submitted) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">Your message has been sent successfully. We'll get back to you soon.</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name<span className="text-red-500">*</span>
          </label>
          <Input id="name" name="name" placeholder="e.g., ABC Industries Pvt Ltd" required className="w-full" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address<span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="e.g., Manufacturer, Supplier, Distributor"
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description of the issue<span className="text-red-500">*</span>
        </label>
        <Textarea id="description" name="description" required className="min-h-[150px]" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="orderId" className="text-sm font-medium">
            Order ID
          </label>
          <Input id="orderId" name="orderId" placeholder="e.g., ABC Industries Pvt Ltd" className="w-full" />
        </div>
        <div className="space-y-2">
          <label htmlFor="queryType" className="text-sm font-medium">
            Query Type
          </label>
          <Select name="queryType" defaultValue="technical">
            <SelectTrigger>
              <SelectValue placeholder="Select Option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical Issue</SelectItem>
              <SelectItem value="order">Order Issue</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white px-8">
      {pending ? "Sending..." : "Submit"}
    </Button>
  )
}
