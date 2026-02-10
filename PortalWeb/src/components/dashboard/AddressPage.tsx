"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, MapPin, Trash2, Edit } from "lucide-react"
import { Country, State } from "country-state-city"
import { CountryStateSelect } from "./CountryStateSelect"
import { toast } from "@/hooks/use-toast"

interface BuyerAddress {
  _id: string
  firstName: string
  lastName: string
  companyName?: string
  address: string
  country: string
  state: string
  city: string
  zipCode: string
  email: string
  phoneNumber: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function AddressPage() {
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addresses, setAddresses] = useState<BuyerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [countries] = useState(Country.getAllCountries())
  const [editingAddress, setEditingAddress] = useState<BuyerAddress | null>(null)

  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    companyName: "",
    address: "",
    country: "IN", // Default to India
    state: "",
    city: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
    isDefault: false,
  })

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/buyer-addresses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch addresses")
      }

      const data = await response.json()
      if (data.success) {
        setAddresses(data.addresses || [])
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch addresses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
      state: "",
    }))
  }

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "address", label: "Address" },
      { field: "country", label: "Country" },
      { field: "state", label: "State" },
      { field: "city", label: "City" },
      { field: "zipCode", label: "Zip Code" },
      { field: "email", label: "Email" },
      { field: "phoneNumber", label: "Phone Number" },
    ]

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Validation Error",
          description: `${label} is required`,
          variant: "destructive",
        })
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    // Phone validation (basic)
    if (formData.phoneNumber.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const resetForm = () => {
    setFormData({
      _id: "",
      firstName: "",
      lastName: "",
      companyName: "",
      address: "",
      country: "IN",
      state: "",
      city: "",
      zipCode: "",
      email: "",
      phoneNumber: "",
      isDefault: false,
    })
    setEditingAddress(null)
  }

  const handleEdit = (address: BuyerAddress) => {
    setEditingAddress(address)
    setFormData({
      _id: address._id,
      firstName: address.firstName,
      lastName: address.lastName,
      companyName: address.companyName || "",
      address: address.address,
      country: address.country,
      state: address.state,
      city: address.city,
      zipCode: address.zipCode,
      email: address.email,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    })
    setShowAddressForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      const isEditing = editingAddress !== null
      const url = "/api/buyer-addresses"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "save"} address`)
      }

      if (data.success) {
        toast({
          title: "Success",
          description: `Address ${isEditing ? "updated" : "saved"} successfully`,
        })

        // Reset form and close modal
        resetForm()
        setShowAddressForm(false)

        // Refresh addresses list
        await fetchAddresses()
      }
    } catch (error: any) {
      console.error("Error saving address:", error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingAddress ? "update" : "save"} address. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return
    }

    try {
      const response = await fetch(`/api/buyer-addresses?id=${addressId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete address")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        })
        await fetchAddresses()
      }
    } catch (error: any) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleCloseForm = () => {
    resetForm()
    setShowAddressForm(false)
  }

  const getCountryName = (countryCode: string) => {
    return countries.find((c) => c.isoCode === countryCode)?.name || countryCode
  }

  const getStateName = (countryCode: string, stateCode: string) => {
    const states = State.getStatesOfCountry(countryCode)
    return states.find((s) => s.isoCode === stateCode)?.name || stateCode
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <Button
            className="bg-emerald-900 hover:bg-emerald-800 text-white w-full sm:w-auto"
            onClick={() => setShowAddressForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </div>

        {addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <Card key={address._id} className="p-4 relative">
                {address.isDefault && (
                  <div className="absolute top-2 right-2 bg-emerald-900 text-white text-xs px-2 py-1 rounded">
                    Default
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-emerald-900 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {address.firstName} {address.lastName}
                    </h3>
                    {address.companyName && <p className="text-sm text-gray-600 truncate">{address.companyName}</p>}
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="break-words">{address.address}</p>
                  <p>
                    {address.city}, {getStateName(address.country, address.state)} {address.zipCode}
                  </p>
                  <p>{getCountryName(address.country)}</p>
                  <p className="break-all">{address.email}</p>
                  <p>{address.phoneNumber}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-emerald-50 hover:border-emerald-900 bg-transparent"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-50 hover:border-red-500 hover:text-red-600 bg-transparent"
                    onClick={() => handleDelete(address._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
            <p className="text-gray-600 mb-4">Add your first address to get started</p>
            <Button className="bg-emerald-900 hover:bg-emerald-800 text-white" onClick={() => setShowAddressForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </div>
        )}
      </Card>

      {/* Address Form Modal */}
      {showAddressForm && (
        <Card className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingAddress ? "Edit Address" : "Add New Address"}</h2>
            <Button variant="ghost" size="icon" onClick={handleCloseForm} disabled={submitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                disabled={submitting}
                placeholder="Enter company name"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                disabled={submitting}
                placeholder="Enter full address"
              />
            </div>

            {/* Country and State */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <CountryStateSelect
                  selectedCountry={formData.country}
                  selectedState={formData.state}
                  onCountryChange={handleCountryChange}
                  onStateChange={handleStateChange}
                  label="country"
                />
              </div>
            </div>

            {/* City and Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  placeholder="Enter zip code"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={submitting}
                placeholder="Enter email address"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                disabled={submitting}
                placeholder="Enter phone number"
              />
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                disabled={submitting}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="text-sm">
                Set as default address
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8" disabled={submitting}>
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingAddress ? "Updating..." : "Saving..."}
                  </div>
                ) : editingAddress ? (
                  "Update Address"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
