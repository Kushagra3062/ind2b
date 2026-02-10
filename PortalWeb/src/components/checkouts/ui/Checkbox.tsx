import type React from "react"
import type { InputHTMLAttributes, ReactNode } from "react"

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className = "", ...props }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...props}
        />
        {label && <span className="ml-2 text-gray-700">{label}</span>}
      </div>
    </label>
  )
}

export default Checkbox
