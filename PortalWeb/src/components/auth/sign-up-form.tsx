"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { ContactModal } from "./contact-modal"
import { useSearchParams } from "next/navigation"
import { validateEmail, isPasswordValid } from "@/lib/validation"

interface SignUpFormProps {
  onSuccess: (message: string) => void
  onSignIn: () => void
}

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<"support" | "customer-care">("support")
  const [userType, setUserType] = useState("customer")
  const [gstError, setGstError] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [password, setPassword] = useState("")

  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is signing up as seller from URL params
    const type = searchParams.get("type")
    const pathname = window.location.pathname

    // Check both URL parameter and pathname for seller signup
    if (type === "seller" || pathname.includes("/seller")) {
      setUserType("seller")
    }
  }, [searchParams])

  // GST Number validation function
  const validateGSTNumber = (gstNumber: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanGST = gstNumber.replace(/\s/g, "").toUpperCase()

    // GST format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit (entity number) + 1 alphabet (Z) + 1 alphanumeric (checksum)
    // Total 15 characters
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/

    return gstRegex.test(cleanGST)
  }

  const handleGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGstError("")

    if (value && !validateGSTNumber(value)) {
      setGstError("Invalid GST format. Example: 22AAAAA0000A1Z5")
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError("")

    if (value) {
      const validation = validateEmail(value)
      if (!validation.isValid) {
        setEmailError(validation.error || "")
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    setGstError("")
    setEmailError("")

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "Invalid email")
      setIsLoading(false)
      return
    }

    const passwordValidation = isPasswordValid(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Invalid password")
      setIsLoading(false)
      return
    }

    // Validate GST number for sellers before submission
    if (userType === "seller") {
      const gstNumber = formData.get("gstNumber") as string
      if (gstNumber && !validateGSTNumber(gstNumber)) {
        setGstError("Please enter a valid GST number")
        setIsLoading(false)
        return
      }
    }

    // Add user type to form data
    formData.append("userType", userType)

    const result = await signUp(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // If seller signup is successful, redirect to light onboarding
    if (userType === "seller") {
      onSuccess("Registration successful! Please sign in to continue with seller setup.")
    } else {
      onSuccess("User registered successfully. Please sign in.")
    }
  }

  const handleContactClick = (type: "support" | "customer-care") => {
    setContactType(type)
    setShowContactModal(true)
  }

  const isSellerSignup = userType === "seller"

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl px-12 py-0.5 font-semibold text-white">
          {isSellerSignup ? "Register as Seller" : "Register Now"}
        </h1>
        <p className="text-gray-400 px-14"></p>
      </div>
      <form action={handleSubmit} className="space-y-2">
        <div>
          <p className="text-gray-50 px-1 py-1">Full Name</p>
          <Input id="name" name="name" required className="h-9 px-8 bg-white text-black  rounded-lg" />
        </div>
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
            className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
          />
          {emailError && <p className="text-sm text-red-400 mt-1 px-1">{emailError}</p>}
          <p className="text-xs text-gray-300 mt-1 px-1"></p>
        </div>
        <div>
          <p className="text-gray-50 px-1 py-1">Password</p>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder=""
            showStrength={true}
            name="password"
            id="password"
          />
        </div>
        {isSellerSignup && (
          <div>
            <p className="text-gray-50 px-1 py-1">GST Number</p>
            <Input
              id="gstNumber"
              name="gstNumber"
              required
              placeholder="22AAAAA0000A1Z5"
              className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
              onChange={handleGSTChange}
              maxLength={15}
            />
            {gstError && <p className="text-sm text-red-400 mt-1 px-1">{gstError}</p>}
            <p className="text-xs text-gray-300 mt-1 px-1">Enter 15-character GST number</p>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <div className="text-center text-sm text-gray-100">
        Already have an account?{" "}
        <button onClick={onSignIn} className="text-gray-100 hover:text-purple-300">
          Sign in
        </button>
      </div>
      <div className="flex justify-center gap-8 text-xs text-gray-100">
        <button onClick={() => handleContactClick("support")} className="hover:text-gray-400 transition-colors">
          Support
        </button>
        <button onClick={() => handleContactClick("customer-care")} className="hover:text-gray-400 transition-colors">
          Customer Care
        </button>
      </div>
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} type={contactType} />
    </div>
  )
}
