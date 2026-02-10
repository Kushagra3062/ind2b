"use client"

import type React from "react"

interface SelectFieldProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

const SelectField: React.FC<SelectFieldProps> = ({ value, onChange, options, placeholder, className }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded px-3 py-2 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default SelectField
