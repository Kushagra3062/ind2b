"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { isPasswordValid } from "@/lib/validation"

export default function PasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdatePassword = async () => {
    console.log("[v0] ===== UPDATE PASSWORD CLICKED =====")
    console.log("[v0] Form data:", formData)

    setError(null)
    setMessage(null)

    if (!formData.currentPassword) {
      console.log("[v0] Current password is empty")
      setError("Please enter your current password.")
      return
    }

    if (!formData.newPassword) {
      console.log("[v0] New password is empty")
      setError("Please enter a new password.")
      return
    }

    if (!formData.confirmPassword) {
      console.log("[v0] Confirm password is empty")
      setError("Please confirm your new password.")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      console.log("[v0] Passwords do not match")
      setError("New password and confirm password do not match.")
      return
    }

    console.log("[v0] Validating password strength...")
    const passwordValidation = isPasswordValid(formData.newPassword)
    console.log("[v0] Password validation result:", passwordValidation)

    if (!passwordValidation.isValid) {
      console.log("[v0] Password validation failed:", passwordValidation.error)
      setError(passwordValidation.error || "Password does not meet requirements.")
      return
    }

    console.log("[v0] All validations passed, making API call...")
    setLoading(true)

    try {
      console.log("[v0] Sending POST request to /api/users/change-password")
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        console.log("[v0] API returned error:", data.error)
        setError(data.error || "Failed to update password.")
      } else {
        console.log("[v0] Password updated successfully!")
        setMessage(data.message || "Password updated successfully.")
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (err) {
      console.error("[v0] Exception caught:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
      console.log("[v0] ===== UPDATE PASSWORD COMPLETE =====")
    }
  }

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      <div className="max-w-md space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => {
              setFormData({ ...formData, currentPassword: e.target.value })
            }}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <PasswordInput
            id="newPassword"
            value={formData.newPassword}
            onChange={(value) => {
              setFormData({ ...formData, newPassword: value })
            }}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value })
            }}
            disabled={loading}
            className={
              formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "border-red-500" : ""
            }
          />
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="text-sm text-red-500">Passwords do not match</p>
          )}
          {formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword &&
            formData.confirmPassword && <p className="text-sm text-green-600">✓ Passwords match</p>}
        </div>
        <Button
          type="button"
          onClick={handleUpdatePassword}
          className="bg-green-700 hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </Card>
  )
}
