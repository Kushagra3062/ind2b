// Global declaration for Razorpay checkout.js
declare interface Window {
  Razorpay: typeof RazorpayClient
}

declare class RazorpayClient {
  constructor(options: RazorpayOptions)
  open(): void
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill?: RazorpayPrefill
  theme?: RazorpayTheme
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayPrefill {
  name?: string
  email?: string
  contact?: string
}

interface RazorpayTheme {
  color: string
}
