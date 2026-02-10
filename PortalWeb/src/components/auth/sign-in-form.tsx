"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordResetModal } from "./password-reset-modal"
import { ContactModal } from "./contact-modal"
import { useRouter } from "next/navigation" // Added useRouter for smooth navigation without page reload

interface SignInFormProps {
  onSuccess: (user?: any) => void
  onSignUp: () => void
  setIsLoading: (isLoading: boolean) => void
}

export function SignInForm({ onSuccess, onSignUp, setIsLoading }: SignInFormProps) {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetSuccessMessage, setResetSuccessMessage] = useState("")
  const [email, setEmail] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<"support" | "customer-care">("support")

  const router = useRouter()

  // Load saved email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setIsLoading(true)
    setError("")

    const emailValue = formData.get("email") as string

    // Save or remove email based on remember me checkbox
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", emailValue)
    } else {
      localStorage.removeItem("rememberedEmail")
    }

    const result = await signIn(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      setIsLoading(false)
      return
    }

    if (result.success && result.user) {
      onSuccess(result.user)
    } else {
      onSuccess()
    }

    router.refresh()
  }

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false)
    setResetSuccessMessage("Password reset successfully! You can now login with your new password.")
    setTimeout(() => setResetSuccessMessage(""), 5000)
  }

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPasswordReset(true)
  }

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleContactClick = (type: "support" | "customer-care") => {
    setContactType(type)
    setShowContactModal(true)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl px-20 font-semibold text-white">Login</h1>
        <p className="text-gray-200 px-16">Glad you're back!</p>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <p className="text-gray-50 px-1 py-1">Email</p>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            placeholder=""
            className="h-9 px-8 bg-white text-white-100 placeholder:text-gray-500 rounded-lg"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <p className="text-gray-50 px-1 py-1">Password</p>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder=""
            className="h-9 px-8 bg-white text-green placeholder:text-gray-500 rounded-lg"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            name="remember"
            checked={rememberMe}
            onCheckedChange={handleRememberMeChange}
            className="border-gray-100 data-[state=checked]:bg-purple-600"
            disabled={isSubmitting}
          />
          <label htmlFor="remember" className="text-sm text-gray-100">
            Remember me
          </label>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {resetSuccessMessage && <p className="text-sm text-green-400">{resetSuccessMessage}</p>}
        <Button
          type="submit"
          className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
        <div className="text-center ">
          <button
            onClick={handleForgotPasswordClick}
            className="text-sm text-gray-50 hover:text-white"
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        </div>
      </form>
      <div className="text-center text-sm text-gray-200">
        Don't have an account?{" "}
        <button onClick={onSignUp} className="text-purple-400 hover:text-gray-200" disabled={isSubmitting}>
          Signup
        </button>
      </div>
      <div className="flex justify-center gap-8 text-xs text-gray-200 py-2">
        <button onClick={() => handleContactClick("support")} className="hover:text-gray-400 transition-colors">
          Support
        </button>
        <button onClick={() => handleContactClick("customer-care")} className="hover:text-gray-400 transition-colors">
          Customer Care
        </button>
      </div>
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onSuccess={handlePasswordResetSuccess}
      />
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} type={contactType} />
    </div>
  )
}
