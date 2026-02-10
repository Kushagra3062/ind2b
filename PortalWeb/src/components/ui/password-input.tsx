"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { validatePassword, type PasswordStrength } from "@/lib/validation"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  showStrength?: boolean
  name?: string
  id?: string
  required?: boolean
  className?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  disabled = false,
  showStrength = true,
  name = "password",
  id = "password",
  required = true,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const strength: PasswordStrength = validatePassword(value)

  const getStrengthBarColor = (index: number) => {
    if (strength.score === 0) return "bg-gray-300"
    if (index < strength.score) {
      if (strength.label === "Strong") return "bg-green-600"
      if (strength.label === "Medium") return "bg-yellow-600"
      if (strength.label === "Fair") return "bg-orange-600"
      return "bg-red-600"
    }
    return "bg-gray-300"
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`h-9 px-8 pr-12 bg-white text-black placeholder:text-gray-500 rounded-lg ${className}`}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          disabled={disabled}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrength && value && (
        <div className="space-y-2">
          {/* Strength bars */}
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className={`h-1 flex-1 rounded-full transition-colors ${getStrengthBarColor(index)}`} />
            ))}
          </div>

          {/* Strength label */}
          <p className={`text-xs font-medium ${strength.color}`}>Password Strength: {strength.label}</p>

          {/* Requirements checklist (show when focused or password is weak) */}
          {(isFocused || strength.score < 4) && (
            <div className="space-y-1 text-xs">
              <RequirementItem met={strength.requirements.length} text="At least 6 characters" />
              <RequirementItem met={strength.requirements.letter} text="Contains a letter" />
              <RequirementItem met={strength.requirements.number} text="Contains a number" />
              <RequirementItem met={strength.requirements.special} text="Contains a special character" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <Check size={12} className="text-green-600 flex-shrink-0" />
      ) : (
        <X size={12} className="text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? "text-green-600" : "text-gray-500"}>{text}</span>
    </div>
  )
}
