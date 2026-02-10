import type React from "react"
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react"

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  multiline?: false
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  error?: string
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  error?: string
}

type CombinedTextFieldProps = TextFieldProps | TextAreaProps

const TextField: React.FC<CombinedTextFieldProps> = ({
  className = "",
  size = "md",
  fullWidth = true,
  error,
  ...props
}) => {
  const baseClasses =
    "block w-full rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-white bg-gray-700"

  const sizeClasses = {
    sm: "py-1 px-2 text-sm",
    md: "py-2 px-3 text-sm",
    lg: "py-2.5 px-4 text-base",
  }

  const widthClass = fullWidth ? "w-full" : ""

  const classes = `${baseClasses} ${sizeClasses[size]} ${widthClass} ${className}`

  if ("multiline" in props && props.multiline) {
    const { multiline, ...textareaProps } = props
    return (
      <div className="w-full">
        <textarea className={classes} {...textareaProps} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  const { size: inputSize, fullWidth: inputFullWidth, error: inputError, ...inputProps } = props as TextFieldProps
  return (
    <div className="w-full">
      <input className={classes} {...inputProps} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default TextField
