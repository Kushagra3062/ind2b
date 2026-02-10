"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import TextField from "@/components/ui/TextField"
import { Country, State, City } from "country-state-city"

interface BillingFormProps {
  onBillingDetailsSubmit: (billingDetails: BillingDetails) => void
  initialValues?: BillingDetails
}

export interface BillingDetails {
  firstName: string
  lastName: string
  companyName?: string
  address: string
  country: string
  state: string
  city: string
  zipCode: string
  email: string
  phoneNumber: string // Changed from 'phone' to 'phoneNumber' to match actual usage
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

function checkMetroPincode(
  pin: string,
): { status: "idle" } | { status: "valid"; city: string } | { status: "invalid"; reason: string } {
  const normalized = (pin || "").trim()
  if (!normalized) return { status: "idle" }
  if (!/^\d{6}$/.test(normalized)) {
    return { status: "invalid", reason: "Please enter a valid 6-digit pincode." }
  }
  const prefix = normalized.slice(0, 3)
  for (const [city, prefixes] of Object.entries(METRO_PREFIXES)) {
    if (prefixes.includes(prefix)) {
      return { status: "valid", city }
    }
  }
  return {
    status: "invalid",
    reason: "Pincode is not available for delivery of products. We will start service soon.",
  }
}

const BillingForm: React.FC<BillingFormProps> = ({ onBillingDetailsSubmit, initialValues }) => {
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    companyName: initialValues?.companyName || "",
    address: initialValues?.address || "",
    country: initialValues?.country || "IN", // Default to India
    state: initialValues?.state || "",
    city: initialValues?.city || "",
    zipCode: initialValues?.zipCode || "",
    email: initialValues?.email || "",
    phoneNumber: initialValues?.phoneNumber || "",
  })
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({})
  const [touchedFields, setTouchedFields] = useState<Set<keyof BillingDetails>>(new Set())
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Load countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  // Update states when country changes
  useEffect(() => {
    if (billingDetails.country) {
      const countryStates = State.getStatesOfCountry(billingDetails.country) || []
      setStates(countryStates)
    } else {
      setStates([])
    }
  }, [billingDetails.country])

  // Update cities when state changes
  useEffect(() => {
    if (billingDetails.country && billingDetails.state) {
      const citiesData = City.getCitiesOfState(billingDetails.country, billingDetails.state) || []
      setCities(citiesData)
    } else {
      setCities([])
    }
  }, [billingDetails.country, billingDetails.state])

  // Validate form on input change, but only show errors for touched fields or after submission
  useEffect(() => {
    validateForm()
  }, [billingDetails, touchedFields, formSubmitted])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BillingDetails, string>> = {}
    let valid = true

    // Validate all fields but only show errors for touched fields or after form submission
    if (!billingDetails.firstName.trim()) {
      newErrors.firstName = "First name is required"
      valid = false
    }

    if (!billingDetails.lastName.trim()) {
      newErrors.lastName = "Last name is required"
      valid = false
    }

    if (!billingDetails.companyName?.trim()) {
      newErrors.companyName = "Company name is required"
      valid = false
    }

    if (!billingDetails.address.trim()) {
      newErrors.address = "Address is required"
      valid = false
    }

    if (!billingDetails.country) {
      newErrors.country = "Country is required"
      valid = false
    }

    if (!billingDetails.state) {
      newErrors.state = "State is required"
      valid = false
    }

    if (!billingDetails.city) {
      newErrors.city = "City is required"
      valid = false
    }

    if (!billingDetails.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required"
      valid = false
    }

    // Email validation
    if (!billingDetails.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(billingDetails.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    // Phone validation
    if (!billingDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
      valid = false
    }

    // Filter errors to only show for touched fields or after form submission
    const filteredErrors: Partial<Record<keyof BillingDetails, string>> = {}
    Object.keys(newErrors).forEach((key) => {
      const fieldKey = key as keyof BillingDetails
      if (touchedFields.has(fieldKey) || formSubmitted) {
        filteredErrors[fieldKey] = newErrors[fieldKey]
      }
    })

    setErrors(filteredErrors)
    return valid
  }

  const handleChange = (field: keyof BillingDetails, value: string | boolean) => {
    if (field === "zipCode" && typeof value === "string") {
      const sanitized = value.replace(/[^\d]/g, "").slice(0, 6)
      setBillingDetails((prev) => ({ ...prev, [field]: sanitized }))
      setTouchedFields((prev) => new Set(prev).add(field))
      return
    }
    setBillingDetails((prev) => ({ ...prev, [field]: value }))
    setTouchedFields((prev) => new Set(prev).add(field))
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value
    setBillingDetails((prev) => ({
      ...prev,
      country: countryCode,
      state: "", // Reset state when country changes
      city: "", // Reset city when country changes
    }))
    setTouchedFields((prev) => {
      const newTouched = new Set(prev)
      newTouched.add("country")
      return newTouched
    })
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value
    setBillingDetails((prev) => ({
      ...prev,
      state: stateCode,
      city: "", // Reset city when state changes
    }))
    setTouchedFields((prev) => {
      const newTouched = new Set(prev)
      newTouched.add("state")
      return newTouched
    })
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("city", e.target.value)
  }

  const handleBlur = (field: keyof BillingDetails) => {
    setTouchedFields((prev) => new Set(prev).add(field))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    const isValid = validateForm()
    if (isValid) {
      onBillingDetailsSubmit(billingDetails)
    } else {
      // Scroll to the first error
      const firstErrorField = document.querySelector(".text-red-500")
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Helper function to determine if we should show an error for a field
  const shouldShowError = (field: keyof BillingDetails) => {
    return errors[field] && (touchedFields.has(field) || formSubmitted)
  }

  // Compute pincode delivery eligibility from zipCode
  const zipStatus = useMemo(() => checkMetroPincode(billingDetails.zipCode), [billingDetails.zipCode])

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder="First name"
              value={billingDetails.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              error={shouldShowError("firstName") ? errors.firstName : undefined}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder="Last name"
              value={billingDetails.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              error={shouldShowError("lastName") ? errors.lastName : undefined}
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <TextField
          placeholder="Company name"
          value={billingDetails.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          onBlur={() => handleBlur("companyName")}
          error={shouldShowError("companyName") ? errors.companyName : undefined}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <TextField
          placeholder="Address"
          value={billingDetails.address}
          onChange={(e) => handleChange("address", e.target.value)}
          onBlur={() => handleBlur("address")}
          error={shouldShowError("address") ? errors.address : undefined}
        />
      </div>

      {/* Country and State in one row */}
      <div className="mb-4">
        <div className="flex flex-row gap-3">
          <div className="w-1/2">
            <label className="block text-sm text-gray-600 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={billingDetails.country}
              onChange={handleCountryChange}
              onBlur={() => handleBlur("country")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select country...</option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
            {shouldShowError("country") && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-sm text-gray-600 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={billingDetails.state}
              onChange={handleStateChange}
              onBlur={() => handleBlur("state")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select state...</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
            {shouldShowError("state") && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>
      </div>

      {/* City and Zip Code in one row */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              value={billingDetails.city}
              onChange={handleCityChange}
              onBlur={() => handleBlur("city")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select city...</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {shouldShowError("city") && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder="Zip code"
              value={billingDetails.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              onBlur={() => handleBlur("zipCode")}
              error={shouldShowError("zipCode") ? errors.zipCode : undefined}
            />
            {billingDetails.zipCode && billingDetails.zipCode.length >= 1 && (
              <p
                className={
                  zipStatus.status === "valid"
                    ? "text-green-600 text-xs mt-1"
                    : zipStatus.status === "invalid"
                      ? "text-red-600 text-xs mt-1"
                      : "text-gray-500 text-xs mt-1"
                }
                id="zip-help"
                aria-live="polite"
              >
                {zipStatus.status === "idle" && ""}
                {zipStatus.status === "valid" && `Available for delivery in ${zipStatus.city}.`}
                {zipStatus.status === "invalid" && zipStatus.reason}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <TextField
            placeholder="Email"
            value={billingDetails.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={shouldShowError("email") ? errors.email : undefined}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <TextField
            placeholder="Phone number"
            value={billingDetails.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            onBlur={() => handleBlur("phoneNumber")}
            error={shouldShowError("phoneNumber") ? errors.phoneNumber : undefined}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  )
}

export default BillingForm
