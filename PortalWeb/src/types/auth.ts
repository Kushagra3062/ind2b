export interface User {
  id: string
  phoneNumber: string | null
  displayName?: string | null
  type: "admin" | "seller" | "customer"
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface OTPResponse {
  success: boolean
  message: string
  verificationId?: string
}

export interface VerifyOTPResponse {
  success: boolean
  message: string
  user?: User
}
