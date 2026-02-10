"use client"

import { useState, useEffect } from "react"

export default function RazorpayDebugPage() {
  const [keyStatus, setKeyStatus] = useState<{
    loading: boolean
    success?: boolean
    message?: string
    error?: string
  }>({ loading: true })

  const [orderCreationStatus, setOrderCreationStatus] = useState<{
    loading: boolean
    success?: boolean
    message?: string
    error?: string
    orderId?: string
  }>({ loading: false })

  // Test Razorpay keys
  useEffect(() => {
    async function testKeys() {
      try {
        const response = await fetch("/api/payments/test-keys")
        const data = await response.json()

        if (data.success) {
          setKeyStatus({
            loading: false,
            success: true,
            message: data.message,
          })
        } else {
          setKeyStatus({
            loading: false,
            success: false,
            error: data.error || "Unknown error",
          })
        }
      } catch (error) {
        setKeyStatus({
          loading: false,
          success: false,
          error: error instanceof Error ? error.message : "Failed to test Razorpay keys",
        })
      }
    }

    testKeys()
  }, [])

  // Create a test order
  const createTestOrder = async () => {
    setOrderCreationStatus({ loading: true })

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 1, // 1 INR for testing
          currency: "INR",
          receipt: `debug_${Date.now()}`,
          notes: {
            description: "Debug test order",
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderCreationStatus({
          loading: false,
          success: true,
          message: "Order created successfully",
          orderId: data.id,
        })
      } else {
        setOrderCreationStatus({
          loading: false,
          success: false,
          error: data.error || data.details || "Failed to create order",
        })
      }
    } catch (error) {
      setOrderCreationStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : "Failed to create test order",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Razorpay Debug Page</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="mb-2">
            <span className="font-medium">RAZORPAY_KEY_ID:</span>{" "}
            {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "✅ Set (client-side)" : "❌ Not set (client-side)"}
          </p>
          <p>
            <span className="font-medium">Server-side keys:</span>{" "}
            {keyStatus.loading ? (
              "Loading..."
            ) : keyStatus.success ? (
              <span className="text-green-600">✅ Valid</span>
            ) : (
              <span className="text-red-600">❌ Invalid or missing</span>
            )}
          </p>
          {keyStatus.error && <p className="text-red-600 mt-2">Error: {keyStatus.error}</p>}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Order Creation</h2>
        <button
          onClick={createTestOrder}
          disabled={orderCreationStatus.loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {orderCreationStatus.loading ? "Creating..." : "Create Test Order (₹1)"}
        </button>

        {orderCreationStatus.success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">
              <span className="font-medium">Success:</span> {orderCreationStatus.message}
            </p>
            <p className="text-green-700 mt-2">
              <span className="font-medium">Order ID:</span> {orderCreationStatus.orderId}
            </p>
          </div>
        )}

        {orderCreationStatus.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">
              <span className="font-medium">Error:</span> {orderCreationStatus.error}
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Verify that your Razorpay API keys are correctly set in your environment variables.</li>
          <li>Make sure both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set on the server.</li>
          <li>Ensure NEXT_PUBLIC_RAZORPAY_KEY_ID is set for client-side access.</li>
          <li>Check if your Razorpay account is active and not in test mode (if using production).</li>
          <li>Try creating a test order with a small amount (₹1) to verify the API connection.</li>
          <li>Check the browser console and server logs for detailed error messages.</li>
        </ol>
      </div>
    </div>
  )
}
