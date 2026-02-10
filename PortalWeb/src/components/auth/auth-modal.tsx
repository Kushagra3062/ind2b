"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser } from "@/actions/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userData?: { id: string; name: string; email: string; type: "admin" | "seller" | "customer" }) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false)

  // Close modal if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      if (isOpen) {
        const user = await getCurrentUser()
        if (user) {
          onSuccess()
        }
      }
    }

    checkUser()
  }, [isOpen, onSuccess])

  useEffect(() => {
    if (isOpen) {
      setPasswordResetSuccess(false)
    }
  }, [isOpen])

  const handleBack = () => {
    if (!isSignIn) {
      setIsSignIn(true)
    } else {
      onClose()
    }
    setSuccessMessage("")
  }

  const handleSignUpSuccess = (message: string) => {
    setSuccessMessage(message)
    setIsSignIn(true)
  }

  const handleSignInSuccess = async (userData?: {
    id: string
    name: string
    email: string
    type: "admin" | "seller" | "customer"
  }) => {
    setIsLoading(true)
    setPasswordResetSuccess(false)
    // Pass user data to parent for instant profile display
    onSuccess(userData)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[400px] p-0 bg-[#004D41] border-0">
        <div className="px-14 py-3 relative">
          <button
            onClick={handleBack}
            className="absolute top-2 left-2 text-white hover:text-gray-200"
            disabled={isLoading}
          >
            <ArrowLeft size={24} />
          </button>
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {isSignIn ? (
            <SignInForm
              onSuccess={handleSignInSuccess}
              onSignUp={() => setIsSignIn(false)}
              setIsLoading={setIsLoading}
            />
          ) : (
            <SignUpForm onSuccess={handleSignUpSuccess} onSignIn={() => setIsSignIn(true)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
