"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { ArrowLeft } from "lucide-react"
import { verifyEmailForReset, resetPassword } from "@/actions/password-reset"
import { validateEmail, isPasswordValid } from "@/lib/validation"

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordResetModal({ isOpen, onClose, onSuccess }: PasswordResetModalProps) {
  const [step, setStep] = useState<"email" | "password">("email")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    if (step === "password") {
      setStep("email")
      setError("")
    } else {
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setStep("email")
    setEmail("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setIsLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Invalid email")
      setIsLoading(false)
      return
    }

    const result = await verifyEmailForReset(email)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setStep("password")
    setIsLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields")
      setIsLoading(false)
      return
    }

    const passwordValidation = isPasswordValid(newPassword)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Invalid password")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const result = await resetPassword(email, newPassword)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    onSuccess()
    resetForm()
  }

  const handleClose = (open: boolean) => {
    if (!open && !isLoading) {
      onClose()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-[#004D41] border-0">
        <div className="px-14 py-3 relative">
          <button
            onClick={handleBack}
            className="absolute top-2 left-2 text-white hover:text-gray-200"
            disabled={isLoading}
          >
            <ArrowLeft size={24} />
          </button>

          {step === "email" ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl px-12 font-semibold text-white">Reset Password</h1>
                <p className="text-gray-200 px-8">Enter your email to reset password</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <p className="text-gray-50 px-1 py-1">Email</p>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
                    disabled={isLoading}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button
                  type="submit"
                  className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Next"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl px-12 font-semibold text-white">New Password</h1>
                <p className="text-gray-200 px-8">Enter your new password</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <p className="text-gray-50 px-1 py-1">New Password</p>
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Enter new password"
                    showStrength={true}
                    name="newPassword"
                    id="newPassword"
                  />
                </div>

                <div>
                  <p className="text-gray-50 px-1 py-1">Confirm Password</p>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Confirm new password"
                    showStrength={false}
                    name="confirmPassword"
                    id="confirmPassword"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button
                  type="submit"
                  className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
