"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { ChevronDown, ChevronUp, Check } from "lucide-react"
import type { RootState } from "@/store"
import { clearCart } from "@/store/slices/cartSlice"
import BillingForm from "./BillingForm"
import AdditionalServicesCard from "./AdditionalServicesCard"
import PaymentOptions from "./paymentOptions"
import OrderSummary from "./OrderSummary"
import WarehouseSelection from "./WarehouseSelection"
import LogisticsSelection from "./LogisticsSelection"
import type { BillingDetails } from "./BillingForm"
import type { PaymentMethod } from "./paymentOptions"
import AdditionalInfo from "./AdditionalInfo"
import { getCurrentUser } from "@/actions/auth"

// Define checkout steps
enum CheckoutStep {
  BILLING = 1,
  ADDITIONAL_SERVICES = 2,
  WAREHOUSE = 3,
  LOGISTICS = 4,
  PAYMENT = 5,
  ADDITIONAL_INFO = 6,
  REVIEW = 7, // Added a review step
}

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.BILLING)
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [warehouseNeeded, setWarehouseNeeded] = useState(false)
  const [logisticsNeeded, setLogisticsNeeded] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
  const [selectedLogistics, setSelectedLogistics] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [totalAmount, setTotalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string
    orderId: string
    signature: string
  } | null>(null)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)

  // Track expanded/collapsed state of each section
  const [expandedSections, setExpandedSections] = useState<Record<CheckoutStep, boolean>>({
    [CheckoutStep.BILLING]: true,
    [CheckoutStep.ADDITIONAL_SERVICES]: false,
    [CheckoutStep.WAREHOUSE]: false,
    [CheckoutStep.LOGISTICS]: false,
    [CheckoutStep.PAYMENT]: false,
    [CheckoutStep.ADDITIONAL_INFO]: false,
    [CheckoutStep.REVIEW]: false,
  })

  // Refs for scrolling to sections
  const sectionRefs = {
    [CheckoutStep.BILLING]: useRef<HTMLDivElement>(null),
    [CheckoutStep.ADDITIONAL_SERVICES]: useRef<HTMLDivElement>(null),
    [CheckoutStep.WAREHOUSE]: useRef<HTMLDivElement>(null),
    [CheckoutStep.LOGISTICS]: useRef<HTMLDivElement>(null),
    [CheckoutStep.PAYMENT]: useRef<HTMLDivElement>(null),
    [CheckoutStep.ADDITIONAL_INFO]: useRef<HTMLDivElement>(null),
    [CheckoutStep.REVIEW]: useRef<HTMLDivElement>(null),
  }

  // Load saved checkout data from sessionStorage on initial render
  useEffect(() => {
    const savedCheckoutData = sessionStorage.getItem("checkoutData")
    if (savedCheckoutData) {
      try {
        const parsedData = JSON.parse(savedCheckoutData)
        if (parsedData.billingDetails) setBillingDetails(parsedData.billingDetails)
        if (parsedData.warehouseNeeded !== undefined) setWarehouseNeeded(parsedData.warehouseNeeded)
        if (parsedData.logisticsNeeded !== undefined) setLogisticsNeeded(parsedData.logisticsNeeded)
        if (parsedData.selectedWarehouse) setSelectedWarehouse(parsedData.selectedWarehouse)
        if (parsedData.selectedLogistics) setSelectedLogistics(parsedData.selectedLogistics)
        if (parsedData.additionalNotes) setAdditionalNotes(parsedData.additionalNotes)
      } catch (error) {
        console.error("Error parsing saved checkout data:", error)
      }
    }
  }, [])

  // Save checkout data to sessionStorage whenever relevant state changes
  useEffect(() => {
    const checkoutData = {
      billingDetails,
      warehouseNeeded,
      logisticsNeeded,
      selectedWarehouse,
      selectedLogistics,
      additionalNotes,
    }
    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData))
  }, [billingDetails, warehouseNeeded, logisticsNeeded, selectedWarehouse, selectedLogistics, additionalNotes])

  // Check if all required steps are completed
  useEffect(() => {
    const requiredStepsCompleted =
      !!billingDetails &&
      (!warehouseNeeded || !!selectedWarehouse) &&
      (!logisticsNeeded || !!selectedLogistics) &&
      !!paymentMethod

    setAllStepsCompleted(requiredStepsCompleted)
  }, [billingDetails, warehouseNeeded, selectedWarehouse, logisticsNeeded, selectedLogistics, paymentMethod])

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !sessionStorage.getItem("lastOrderCompleted")) {
      router.push("/cart")
    }
  }, [cartItems, router])

  // Scroll to current step when it changes
  useEffect(() => {
    const currentRef = sectionRefs[currentStep]?.current
    if (currentRef) {
      currentRef.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [currentStep])

  // Toggle section expanded/collapsed state
  const toggleSection = (step: CheckoutStep) => {
    // Only allow toggling completed steps
    if (step < currentStep) {
      setExpandedSections((prev) => ({
        ...prev,
        [step]: !prev[step],
      }))
    }
  }

  // Handle billing details submission
  const handleBillingDetailsSubmit = (details: BillingDetails) => {
    setBillingDetails(details)
    setCurrentStep(CheckoutStep.ADDITIONAL_SERVICES)

    // Collapse billing section and expand additional services
    setExpandedSections((prev) => ({
      ...prev,
      [CheckoutStep.BILLING]: false,
      [CheckoutStep.ADDITIONAL_SERVICES]: true,
    }))
  }

  // Handle additional services selection
  const handleAdditionalServicesSubmit = (warehouse: boolean, logistics: boolean) => {
    setWarehouseNeeded(warehouse)
    setLogisticsNeeded(logistics)

    // Collapse additional services section
    setExpandedSections((prev) => ({
      ...prev,
      [CheckoutStep.ADDITIONAL_SERVICES]: false,
    }))

    // Determine next step based on selections
    if (warehouse) {
      setCurrentStep(CheckoutStep.WAREHOUSE)
      setExpandedSections((prev) => ({
        ...prev,
        [CheckoutStep.WAREHOUSE]: true,
      }))
    } else if (logistics) {
      setCurrentStep(CheckoutStep.LOGISTICS)
      setExpandedSections((prev) => ({
        ...prev,
        [CheckoutStep.LOGISTICS]: true,
      }))
    } else {
      setCurrentStep(CheckoutStep.PAYMENT)
      setExpandedSections((prev) => ({
        ...prev,
        [CheckoutStep.PAYMENT]: true,
      }))
    }
  }

  // Handle warehouse selection
  const handleWarehouseSelect = (warehouseId: string | null) => {
    setSelectedWarehouse(warehouseId)

    // Collapse warehouse section
    setExpandedSections((prev) => ({
      ...prev,
      [CheckoutStep.WAREHOUSE]: false,
    }))

    // If logistics is also needed, go to logistics step, otherwise go to payment
    if (logisticsNeeded) {
      setCurrentStep(CheckoutStep.LOGISTICS)
      setExpandedSections((prev) => ({
        ...prev,
        [CheckoutStep.LOGISTICS]: true,
      }))
    } else {
      setCurrentStep(CheckoutStep.PAYMENT)
      setExpandedSections((prev) => ({
        ...prev,
        [CheckoutStep.PAYMENT]: true,
      }))
    }
  }

  // Handle logistics selection
  const handleLogisticsSelect = (logisticsId: string | null) => {
    setSelectedLogistics(logisticsId)

    // Collapse logistics section and expand payment
    setExpandedSections((prev) => ({
      ...prev,
      [CheckoutStep.LOGISTICS]: false,
      [CheckoutStep.PAYMENT]: true,
    }))

    setCurrentStep(CheckoutStep.PAYMENT)
  }

  // Handle payment method selection
  const handlePaymentMethodSelect = (
    method: PaymentMethod,
    details?: {
      paymentId: string
      orderId: string
      signature: string
    },
  ) => {
    setPaymentMethod(method)
    if (details) {
      setPaymentDetails(details)
    }

    // Collapse payment section and expand additional info
    setExpandedSections((prev) => ({
      ...prev,
      [CheckoutStep.PAYMENT]: false,
      [CheckoutStep.ADDITIONAL_INFO]: true,
    }))

    setCurrentStep(CheckoutStep.ADDITIONAL_INFO)
  }

  // Handle additional info submission
  const handleAdditionalInfoSubmit = (notes: string) => {
    setAdditionalNotes(notes)

    // Collapse additional info section and expand review
    setExpandedSections((prev) => ({
      ...prev,
      [CheckoutStep.ADDITIONAL_INFO]: false,
      [CheckoutStep.REVIEW]: true,
    }))

    setCurrentStep(CheckoutStep.REVIEW)
  }

  // Calculate subtotal
  const calculateSubTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Calculate discount (for demo purposes)
  const calculateDiscount = () => {
    return 0 // No discount for now
  }

  // Calculate tax (for demo purposes)
  const calculateTax = () => {
    const subtotal = calculateSubTotal()
    return subtotal * 0.18 // 18% tax
  }

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!billingDetails || !paymentMethod) {
      return
    }

    setIsProcessing(true)

    try {
      // Get current user
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Generate unique IDs for products that don't have one
      const productsWithIds = cartItems.map((item, index) => {
        // Ensure each product has a productId
        const productId = item.id || `temp-product-${Date.now()}-${index}`

        return {
          productId: productId,
          id: productId, // Include both id and productId for redundancy
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image_link: item.image_link, // Use the correct field name
        }
      })

      const appliedCoupon = sessionStorage.getItem("appliedCoupon")
      const couponData = appliedCoupon ? JSON.parse(appliedCoupon) : null

      // Prepare order data
      const orderData = {
        userId: user.id,
        products: productsWithIds,
        billingDetails,
        totalAmount,
        subTotal: calculateSubTotal(),
        discount: calculateDiscount(),
        couponCode: couponData?.code || null,
        couponDiscount: couponData?.discountAmount || 0,
        tax: calculateTax(),
        warehouseSelected: warehouseNeeded,
        warehouseId: warehouseNeeded ? selectedWarehouse : null,
        logisticsSelected: logisticsNeeded,
        logisticsId: logisticsNeeded ? selectedLogistics : null,
        paymentMethod,
        paymentDetails: paymentMethod === "ONLINE" ? paymentDetails : null,
        additionalNotes,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      console.log("Creating order with data:", orderData)

      // Create the order
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      console.log("Order creation result:", result)

      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      if (couponData?.code) {
        await fetch("/api/coupons/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponCode: couponData.code }),
        })
      }

      // Clear cart and redirect to success page
      dispatch(clearCart())

      // Store order completion status in session storage
      sessionStorage.setItem("lastOrderCompleted", "true")
      sessionStorage.setItem(
        "orderDetails",
        JSON.stringify({
          orderId: result.orderId,
          totalAmount,
          products: productsWithIds.map((product) => ({
            id: product.productId,
            title: product.title,
            price: product.price,
            quantity: product.quantity,
            image_link: product.image_link,
          })),
        }),
      )

      // Clear checkout data from sessionStorage after successful order
      sessionStorage.removeItem("checkoutData")
      sessionStorage.removeItem("appliedCoupon")

      console.log("Redirecting to success page with orderId:", result.orderId)
      router.push(`/checkout/success?orderId=${result.orderId}`)
    } catch (error) {
      console.error("Error placing order:", error)
      setIsProcessing(false)
      alert(`Error: ${error instanceof Error ? error.message : "Failed to place order"}`)
    }
  }

  const handleTotalAmountChange = (amount: number) => {
    setTotalAmount(amount)
  }

  // Render section header with toggle functionality
  const renderSectionHeader = (step: CheckoutStep, title: string, isCompleted: boolean) => {
    return (
      <div
        className={`flex items-center justify-between p-4 border-b ${
          currentStep === step ? "bg-orange-50" : ""
        } ${isCompleted ? "cursor-pointer" : ""}`}
        onClick={() => (isCompleted ? toggleSection(step) : null)}
      >
        <div className="flex items-center">
          {isCompleted && (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <h3 className="font-medium">{title}</h3>
        </div>
        {isCompleted &&
          (expandedSections[step] ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ))}
      </div>
    )
  }

  // Render the final review section
  const renderReviewSection = () => {
    return (
      <div className="p-6">
        <h2 className="text-lg font-medium mb-4">Order Review</h2>
        <p className="text-sm text-gray-600 mb-6">Please review your order details before placing your order.</p>

        {/* Order summary for review */}
        <div className="space-y-4 mb-6">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            {billingDetails && (
              <div className="text-sm text-gray-600">
                <p>
                  {billingDetails.firstName} {billingDetails.lastName}
                </p>
                <p>{billingDetails.address}</p>
                <p>
                  {billingDetails.city}, {billingDetails.state} {billingDetails.zipCode}
                </p>
                <p>{billingDetails.country}</p>
                <p>Phone: {billingDetails.phoneNumber}</p>
                <p>Email: {billingDetails.email}</p>
              </div>
            )}
          </div>

          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Additional Services</h3>
            <div className="text-sm text-gray-600">
              <p>Warehouse Service: {warehouseNeeded ? "Yes" : "No"}</p>
              <p>Logistics Service: {logisticsNeeded ? "Yes" : "No"}</p>
            </div>
          </div>

          {warehouseNeeded && selectedWarehouse && (
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Warehouse</h3>
              <p className="text-sm text-gray-600">Selected Warehouse ID: {selectedWarehouse}</p>
            </div>
          )}

          {logisticsNeeded && selectedLogistics && (
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Logistics</h3>
              <p className="text-sm text-gray-600">Selected Logistics ID: {selectedLogistics}</p>
            </div>
          )}

          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Payment Method</h3>
            <p className="text-sm text-gray-600">{paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
          </div>

          {additionalNotes && (
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Additional Notes</h3>
              <p className="text-sm text-gray-600">{additionalNotes}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600 text-center">
            Please review your order details above and click the "Place Order" button in the Order Summary to complete
            your purchase.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-center mb-8">Shopping Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main checkout content - takes 2/3 of the space */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Information */}
          <div
            ref={sectionRefs[CheckoutStep.BILLING]}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {renderSectionHeader(
              CheckoutStep.BILLING,
              "Billing and Shipping Information",
              currentStep > CheckoutStep.BILLING,
            )}
            {expandedSections[CheckoutStep.BILLING] && (
              <div className="transition-all duration-300">
                <BillingForm
                  onBillingDetailsSubmit={handleBillingDetailsSubmit}
                  initialValues={billingDetails || undefined}
                />
              </div>
            )}
          </div>

          {/* Additional Services Card */}
          {currentStep >= CheckoutStep.ADDITIONAL_SERVICES && (
            <div
              ref={sectionRefs[CheckoutStep.ADDITIONAL_SERVICES]}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {renderSectionHeader(
                CheckoutStep.ADDITIONAL_SERVICES,
                "Additional Services",
                currentStep > CheckoutStep.ADDITIONAL_SERVICES,
              )}
              {expandedSections[CheckoutStep.ADDITIONAL_SERVICES] && (
                <div className="transition-all duration-300">
                  <AdditionalServicesCard
                    onSubmit={handleAdditionalServicesSubmit}
                    disabled={currentStep !== CheckoutStep.ADDITIONAL_SERVICES}
                    initialValues={{ warehouseNeeded, logisticsNeeded }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Warehouse Selection - only shown if warehouse is needed */}
          {warehouseNeeded && currentStep >= CheckoutStep.WAREHOUSE && (
            <div
              ref={sectionRefs[CheckoutStep.WAREHOUSE]}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {renderSectionHeader(CheckoutStep.WAREHOUSE, "Warehouse Selection", currentStep > CheckoutStep.WAREHOUSE)}
              {expandedSections[CheckoutStep.WAREHOUSE] && (
                <div className="transition-all duration-300">
                  <WarehouseSelection
                    onWarehouseSelect={handleWarehouseSelect}
                    disabled={currentStep !== CheckoutStep.WAREHOUSE}
                    initialWarehouse={selectedWarehouse}
                  />
                </div>
              )}
            </div>
          )}

          {/* Logistics Selection - only shown if logistics is needed */}
          {logisticsNeeded && currentStep >= CheckoutStep.LOGISTICS && (
            <div
              ref={sectionRefs[CheckoutStep.LOGISTICS]}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {renderSectionHeader(CheckoutStep.LOGISTICS, "Logistics Selection", currentStep > CheckoutStep.LOGISTICS)}
              {expandedSections[CheckoutStep.LOGISTICS] && (
                <div className="transition-all duration-300">
                  <LogisticsSelection
                    onLogisticsSelect={handleLogisticsSelect}
                    disabled={currentStep !== CheckoutStep.LOGISTICS}
                    initialLogistics={selectedLogistics}
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment Options */}
          {currentStep >= CheckoutStep.PAYMENT && (
            <div
              ref={sectionRefs[CheckoutStep.PAYMENT]}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {renderSectionHeader(CheckoutStep.PAYMENT, "Payment Options", currentStep > CheckoutStep.PAYMENT)}
              {expandedSections[CheckoutStep.PAYMENT] && (
                <div className="transition-all duration-300">
                  <PaymentOptions
                    onPaymentMethodSelect={handlePaymentMethodSelect}
                    disabled={currentStep !== CheckoutStep.PAYMENT}
                    amount={totalAmount} // Pass the total amount to PaymentOptions
                    billingDetails={billingDetails !== null ? billingDetails : undefined} // Convert null to undefined to fix TypeScript error
                  />
                </div>
              )}
            </div>
          )}

          {/* Additional Information */}
          {currentStep >= CheckoutStep.ADDITIONAL_INFO && (
            <div
              ref={sectionRefs[CheckoutStep.ADDITIONAL_INFO]}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {renderSectionHeader(
                CheckoutStep.ADDITIONAL_INFO,
                "Additional Information",
                currentStep > CheckoutStep.ADDITIONAL_INFO,
              )}
              {expandedSections[CheckoutStep.ADDITIONAL_INFO] && (
                <div className="transition-all duration-300">
                  <AdditionalInfo
                    onSubmit={handleAdditionalInfoSubmit}
                    disabled={currentStep !== CheckoutStep.ADDITIONAL_INFO}
                    initialNotes={additionalNotes}
                  />
                </div>
              )}
            </div>
          )}

          {/* Review Section */}
          {currentStep >= CheckoutStep.REVIEW && (
            <div
              ref={sectionRefs[CheckoutStep.REVIEW]}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {renderSectionHeader(CheckoutStep.REVIEW, "Review Order", false)}
              {expandedSections[CheckoutStep.REVIEW] && (
                <div className="transition-all duration-300">{renderReviewSection()}</div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary - takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 pt-4">
            <OrderSummary
              onPlaceOrder={handlePlaceOrder}
              onTotalAmountChange={handleTotalAmountChange}
              isProcessing={isProcessing}
              paymentMethod={paymentMethod}
              allStepsCompleted={allStepsCompleted && currentStep === CheckoutStep.REVIEW}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
