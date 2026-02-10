export interface PasswordStrength {
  isValid: any
  errors: any
  score: number // 0-3 (0=weak, 1=fair, 2=medium, 3=strong)
  label: "Weak" | "Fair" | "Medium" | "Strong"
  color: string
  requirements: {
    length: boolean
    letter: boolean
    number: boolean
    special: boolean
  }
}

/**
 * Validates email format and checks if it's from a valid organization or Gmail
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    return { isValid: false, error: "Email is required" }
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }

  // Extract domain
  const domain = email.split("@")[1]?.toLowerCase()

  if (!domain) {
    return { isValid: false, error: "Invalid email format" }
  }

  // List of common free email providers (allowed)
  const allowedFreeProviders = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.in",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "protonmail.com",
    "zoho.com",
    "aol.com",
  ]

  // Check if it's a free provider or organizational email
  const isFreeProvider = allowedFreeProviders.includes(domain)
  const isOrganizational = domain.split(".").length >= 2 && !domain.includes("test") && !domain.includes("example")

  if (!isFreeProvider && !isOrganizational) {
    return { isValid: false, error: "Please use a valid organizational or Gmail email" }
  }

  // Block temporary/disposable email domains
  const disposableDomains = ["tempmail", "throwaway", "guerrillamail", "10minutemail", "mailinator"]
  const isDisposable = disposableDomains.some((d) => domain.includes(d))

  if (isDisposable) {
    return { isValid: false, error: "Temporary email addresses are not allowed" }
  }

  return { isValid: true }
}

/**
 * Validates password and returns strength score
 */
export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 6,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }

  // Calculate score based on requirements met
  let score = 0
  if (requirements.length) score++
  if (requirements.letter) score++
  if (requirements.number) score++
  if (requirements.special) score++

  // Determine label and color
  let label: "Weak" | "Fair" | "Medium" | "Strong"
  let color: string

  if (score === 4) {
    label = "Strong"
    color = "text-green-600"
  } else if (score === 3) {
    label = "Medium"
    color = "text-yellow-600"
  } else if (score === 2) {
    label = "Fair"
    color = "text-orange-600"
  } else {
    label = "Weak"
    color = "text-red-600"
  }

  return {
    score,
    label,
    color,
    requirements,
  }
}

/**
 * Checks if password meets minimum requirements
 */
export function isPasswordValid(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required" }
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" }
  }

  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  if (!hasLetter) {
    return { isValid: false, error: "Password must contain at least one letter" }
  }

  if (!hasNumber) {
    return { isValid: false, error: "Password must contain at least one number" }
  }

  if (!hasSpecial) {
    return { isValid: false, error: "Password must contain at least one special character" }
  }

  return { isValid: true }
}
