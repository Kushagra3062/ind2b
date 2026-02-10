"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { toast } from "sonner"

interface SendEmailButtonProps {
  orderId: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SendEmailButton({ orderId, variant = "outline", size = "sm", className }: SendEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSendEmail = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/orders/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      toast.success("Order confirmation email sent successfully")
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSendEmail} disabled={isLoading}>
      {isLoading ? (
        <span className="flex items-center gap-1">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          Sending...
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          Send Email
        </span>
      )}
    </Button>
  )
}
