"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Script from "next/script"

export type PaymentMethod = "COD" | "ONLINE"

interface PaymentOptionsProps {
  onPaymentMethodSelect: (
    method: PaymentMethod,
    paymentDetails?: {
      paymentId: string
      orderId: string
      signature: string
    },
  ) => void
  disabled?: boolean
  amount: number // Total amount to be paid
  billingDetails?: {
    zipCode?: string
    [key: string]: any
  }
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal?: {
    ondismiss: () => void
  }
}

// Remove the global declaration since it's already defined in razorpay.d.ts

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  onPaymentMethodSelect,
  disabled = false,
  amount,
  billingDetails,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("COD")
  const [isProcessing, setIsProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [scriptLoading, setScriptLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string
    orderId: string
    signature: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if Razorpay is already loaded and preload it
  useEffect(() => {
    // Check if Razorpay is already available in the window object
    if (typeof window !== "undefined" && window.Razorpay) {
      console.log("Razorpay already available in window")
      setRazorpayLoaded(true)
      setScriptLoading(false)
      return
    }

    // If not available, try to load it immediately
    const loadRazorpayScript = () => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => {
        console.log("Manually loaded Razorpay script on mount")
        setRazorpayLoaded(true)
        setScriptLoading(false)
      }
      script.onerror = () => {
        console.error("Failed to manually load Razorpay script on mount")
        setScriptLoading(false)
      }
      document.body.appendChild(script)
    }

    // Load the script
    loadRazorpayScript()

    // Set a timeout to check if script loaded
    const timeoutId = setTimeout(() => {
      if (!razorpayLoaded && typeof window !== "undefined") {
        console.log("Razorpay script loading timed out, retrying...")
        loadRazorpayScript() // Try loading again
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [razorpayLoaded])

  // Handle Razorpay script loading
  const handleRazorpayLoad = () => {
    console.log("Razorpay script loaded successfully")
    setRazorpayLoaded(true)
    setScriptLoading(false)
  }

  const handleScriptLoadError = () => {
    console.error("Failed to load Razorpay script")
    setError("Failed to load payment gateway. Please try again later.")
    setScriptLoading(false)
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    if (method === "COD" && !codAvailability.available) {
      return
    }

    setSelectedMethod(method)
    // Reset payment details when changing methods
    setPaymentDetails(null)
    setError(null)

    // If selecting online payment, ensure Razorpay is loaded
    if (method === "ONLINE" && !razorpayLoaded) {
      // Try to load Razorpay immediately if not already loaded
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => {
        console.log("Manually loaded Razorpay script on selection")
        setRazorpayLoaded(true)
        setScriptLoading(false)
      }
      script.onerror = () => {
        console.error("Failed to manually load Razorpay script on selection")
        setError("Failed to load payment gateway. Please try again.")
        setScriptLoading(false)
      }
      document.body.appendChild(script)
    }
  }

  // Initialize Razorpay payment
  const initializeRazorpay = async () => {
    // Clear any previous errors
    setError(null)

    // If Razorpay is available in window but our state doesn't reflect it, update state
    if (typeof window !== "undefined" && window.Razorpay && !razorpayLoaded) {
      setRazorpayLoaded(true)
      setScriptLoading(false)
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || typeof window.Razorpay !== "function") {
      console.log("Razorpay not loaded yet, attempting to load it now")

      // Show processing state but don't show error yet
      setIsProcessing(true)

      // Try to load the script immediately
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true

      // Create a promise to wait for script load
      const scriptLoadPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          console.log("Razorpay script loaded successfully in initializeRazorpay")
          setRazorpayLoaded(true)
          setScriptLoading(false)
          resolve(true)
        }
        script.onerror = () => {
          console.error("Failed to load Razorpay script in initializeRazorpay")
          setError("Failed to load payment gateway. Please refresh the page and try again.")
          setScriptLoading(false)
          setIsProcessing(false)
          reject(new Error("Failed to load Razorpay script"))
        }
      })

      document.body.appendChild(script)

      // Wait for script to load with timeout
      try {
        await Promise.race([
          scriptLoadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Script loading timed out")), 5000)),
        ])
      } catch (error) {
        console.error("Error loading Razorpay script:", error)
        setError("Payment gateway loading timed out. Please refresh and try again.")
        setIsProcessing(false)
        return
      }
    }

    if (!amount || amount <= 0) {
      setError("Invalid payment amount. Please try again.")
      console.error("Invalid amount:", amount)
      return
    }

    setIsProcessing(true)

    // Check if Razorpay key is available
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      setError("Payment configuration error. Please contact support.")
      setIsProcessing(false)
      console.error("Razorpay key is not available")
      return
    }

    try {
      console.log("Creating Razorpay order with amount:", amount)

      // Call backend to create an order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            description: "Order payment",
          },
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok || !orderData.success) {
        console.error("Failed to create order:", orderData)
        throw new Error(orderData.error || orderData.details || "Failed to create order")
      }

      console.log("Order created successfully:", orderData)

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: Number(orderData.amount),
        currency: orderData.currency,
        name: "IND2B", // Updated store name
        description: "Purchase Payment",
        order_id: orderData.id,
        handler: (response: RazorpayPaymentResponse) => {
          // This function runs when payment is successful
          console.log("Payment successful:", response)
          setPaymentDetails({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          })

          // Call the onPaymentMethodSelect with payment details
          onPaymentMethodSelect("ONLINE", {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          })

          setIsProcessing(false)
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F97316", // Orange color to match your theme
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed")
            setIsProcessing(false)
          },
        },
      }

      // Open Razorpay payment form
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Razorpay Error:", error)
      setError(error instanceof Error ? error.message : "Payment initialization failed")
      setIsProcessing(false)
    }
  }

  const handleContinue = () => {
    if (selectedMethod === "COD") {
      // For cash on delivery, just proceed
      onPaymentMethodSelect("COD")
    } else {
      // For online payment methods
      if (paymentDetails) {
        // If payment is already completed, proceed with the payment details
        onPaymentMethodSelect("ONLINE", paymentDetails)
      } else {
        // Otherwise initialize Razorpay
        initializeRazorpay()
      }
    }
  }

  const METRO_PREFIXES: Record<string, string[]> = {
    Delhi: ["110"],
    Mumbai: ["400"],
    Bengaluru: ["560"],
    Chennai: ["600"],
    Kolkata: ["700"],
    Hyderabad: ["500"],
    Pune: ["411"],
    Ahmedabad: ["380"],
  }

  function checkMetroPincode(pin: string): { isMetro: boolean; city?: string } {
    const normalized = (pin || "").trim()
    if (!normalized || !/^\d{6}$/.test(normalized)) {
      return { isMetro: false }
    }
    const prefix = normalized.slice(0, 3)
    for (const [city, prefixes] of Object.entries(METRO_PREFIXES)) {
      if (prefixes.includes(prefix)) {
        return {
          isMetro: true,
          city,
        }
      }
    }
    return {
      isMetro: false,
    }
  }

  const codAvailability = useMemo(() => {
    if (!billingDetails?.zipCode) {
      return { available: true, message: "" }
    }
    const pincodeCheck = checkMetroPincode(billingDetails.zipCode)
    if (pincodeCheck.isMetro) {
      return {
        available: true,
        message: `COD available in ${pincodeCheck.city}`,
      }
    }
    return {
      available: false,
      message: "COD not available for remote locations. We will start service soon.",
    }
  }, [billingDetails?.zipCode])

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleRazorpayLoad}
        onError={handleScriptLoadError}
        strategy="afterInteractive"
      />

      <div
        className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-70 pointer-events-none" : ""}`}
      >
        <h2 className="text-lg font-medium mb-2">Payment Option</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose a payment method to continue checking out. You will still have a chance to review and edit your order
          before it is final.
        </p>

        {/* Horizontal Divider at the Top */}
        <div className="w-full h-px bg-gray-200 mb-4"></div>

        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm8.707-7.293a1 1 0 00-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 001.414 1.414L12 13.414l1.293 1.293a1 1 0 00-1.414 1.414L10 14.414l-1.293 1.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293a1 1 0 00-1.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700 font-medium">Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1 ml-7">{error}</p>
            <div className="mt-2 ml-7">
              <button onClick={() => setError(null)} className="text-xs text-red-600 underline hover:text-red-800">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Script loading indicator - make it smaller and less intrusive */}
        {scriptLoading && selectedMethod === "ONLINE" && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <svg
                className="animate-spin h-4 w-4 text-blue-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-blue-700 text-sm">Initializing payment...</span>
            </div>
          </div>
        )}

        {/* On mobile: Vertical stacked with each item taking full width */}
        <div className="sm:hidden">
          {/* Cash on Delivery */}
          <div
            className={`w-full flex items-center justify-between p-4 transition-all ${
              !codAvailability.available
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : selectedMethod === "COD"
                  ? "bg-orange-50 cursor-pointer"
                  : "hover:bg-gray-50 cursor-pointer"
            }`}
            onClick={() => handleMethodSelect("COD")}
          >
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-3">
                <div className="w-8 h-8 flex items-center justify-center text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">Cash on Delivery</span>
                {codAvailability.message && (
                  <span className={`text-xs mt-1 ${codAvailability.available ? "text-green-600" : "text-red-600"}`}>
                    {codAvailability.message}
                  </span>
                )}
              </div>
            </div>

            {/* Selection Circle */}
            {selectedMethod === "COD" && codAvailability.available ? (
              <div className="relative h-4 w-4">
                <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
              </div>
            ) : (
              <div
                className={`h-4 w-4 rounded-full border ${
                  codAvailability.available ? "border-gray-300" : "border-gray-200"
                }`}
              ></div>
            )}
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* Online Payment (Razorpay) */}
          <div
            className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
              selectedMethod === "ONLINE" ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect("ONLINE")}
          >
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-3">
                <div className="w-8 h-8 flex items-center justify-center text-purple-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">Online Payment (Card/UPI/Wallet)</span>
                <span className="text-xs font-medium text-orange-600 mt-1">Pay Amount INR {amount.toFixed(2)}</span>
              </div>
            </div>

            {selectedMethod === "ONLINE" ? (
              <div className="relative h-4 w-4">
                <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full border border-gray-300"></div>
            )}
          </div>
        </div>

        {/* On larger screens: Horizontal layout with equal width columns */}
        <div className="hidden sm:flex">
          {/* Cash on Delivery */}
          <div
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all relative ${
              !codAvailability.available
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : selectedMethod === "COD"
                  ? "bg-orange-50 cursor-pointer"
                  : "hover:bg-gray-50 cursor-pointer"
            }`}
            onClick={() => handleMethodSelect("COD")}
          >
            <div className="w-8 h-8 flex items-center justify-center text-green-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M6 12h.01M18 12h.01"></path>
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center mb-2">Cash on Delivery</span>
            {codAvailability.message && (
              <span
                className={`text-xs text-center mb-4 ${codAvailability.available ? "text-green-600" : "text-red-600"}`}
              >
                {codAvailability.message}
              </span>
            )}

            {/* Circle at the Bottom */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              {selectedMethod === "COD" && codAvailability.available ? (
                <div className="relative h-4 w-4">
                  <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <div
                  className={`h-4 w-4 rounded-full border ${
                    codAvailability.available ? "border-gray-300" : "border-gray-200"
                  }`}
                ></div>
              )}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-16 w-px bg-gray-200 my-2"></div>

          {/* Online Payment (Razorpay) */}
          <div
            className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
              selectedMethod === "ONLINE" ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect("ONLINE")}
          >
            <div className="w-8 h-8 flex items-center justify-center text-purple-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center">Online Payment (Card/UPI/Wallet)</span>
            <span className="text-xs font-medium text-orange-600 mt-1 mb-4">Pay Amount INR {amount.toFixed(2)}</span>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              {selectedMethod === "ONLINE" ? (
                <div className="relative h-4 w-4">
                  <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-gray-300"></div>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Divider at the Bottom */}
        <div className="w-full h-px bg-gray-200 mt-4 mb-6"></div>

        {/* Payment Status */}
        {paymentDetails && selectedMethod === "ONLINE" && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-700 font-medium">Payment Successful!</span>
            </div>
            <p className="text-green-600 text-sm mt-1 ml-7">Payment ID: {paymentDetails.paymentId}</p>
            <p className="text-green-600 text-sm mt-1 ml-7">Order ID: {paymentDetails.orderId}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={isProcessing || (selectedMethod === "COD" && !codAvailability.available)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : paymentDetails && selectedMethod === "ONLINE" ? (
              "Continue to Review"
            ) : selectedMethod === "COD" ? (
              "Continue with Cash on Delivery"
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>
    </>
  )
}

export default PaymentOptions
