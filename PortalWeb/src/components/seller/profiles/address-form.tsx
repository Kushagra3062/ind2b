"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { AddressDetails } from "@/types/profile"
import { saveAddressDetails } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Loader2, Edit } from "lucide-react"
import { Country, State, City } from "country-state-city"
import { LocationDropdown } from "./location-dropdown"

const phoneRegex = /^[0-9]{10,15}$/

const addressSchema = z.object({
  billingAddress: z.object({
    country: z.string().min(2, "Country is required"),
    state: z.string().min(2, "State is required"),
    city: z.string().min(2, "City is required"),
    addressLine1: z.string().min(5, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    phoneNumber: z.string().regex(phoneRegex, "Please enter a valid phone number (10-15 digits)"),
  }),
  pickupAddress: z.object({
    country: z.string().min(2, "Country is required"),
    state: z.string().min(2, "State is required"),
    city: z.string().min(2, "City is required"),
    addressLine1: z.string().min(5, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    phoneNumber: z.string().regex(phoneRegex, "Please enter a valid phone number (10-15 digits)"),
  }),
})

interface AddressFormProps {
  initialData?: AddressDetails
  onSaved?: () => void
  isPrefilledData?: boolean
}

export function AddressForm({ initialData, onSaved, isPrefilledData = false }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If data is prefilled from light form, start in edit mode
  // If data is real saved data, start in read-only mode
  // If no data, start in edit mode
  const [isEditing, setIsEditing] = useState(!initialData || isPrefilledData)

  // States for location dropdowns
  const [billingStates, setBillingStates] = useState<any[]>([])
  const [billingCities, setBillingCities] = useState<any[]>([])
  const [pickupStates, setPickupStates] = useState<any[]>([])
  const [pickupCities, setPickupCities] = useState<any[]>([])

  // Get all countries and sort them with India at the top
  const allCountries = Country.getAllCountries()
  const sortedCountries = [...allCountries].sort((a, b) => {
    if (a.isoCode === "IN") return -1
    if (b.isoCode === "IN") return 1
    return a.name.localeCompare(b.name)
  })

  // Format countries for dropdown
  const countryOptions = sortedCountries.map((country) => ({
    id: country.isoCode,
    name: country.name,
  }))

  // Log the initialData to help debug
  console.log("AddressForm initialData:", initialData)

  const defaultValues = {
    billingAddress: {
      country: "IN", // Default to India
      state: "",
      city: "",
      addressLine1: "",
      addressLine2: "",
      phoneNumber: "",
    },
    pickupAddress: {
      country: "IN", // Default to India
      state: "",
      city: "",
      addressLine1: "",
      addressLine2: "",
      phoneNumber: "",
    },
  }

  const form = useForm<AddressDetails>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData
      ? {
          ...defaultValues,
          ...initialData,
        }
      : defaultValues,
  })

  // Force form reset when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log("Resetting form with initialData:", initialData)
      form.reset({
        billingAddress: {
          country: initialData.billingAddress?.country || "IN",
          state: initialData.billingAddress?.state || "",
          city: initialData.billingAddress?.city || "",
          addressLine1: initialData.billingAddress?.addressLine1 || "",
          addressLine2: initialData.billingAddress?.addressLine2 || "",
          phoneNumber: initialData.billingAddress?.phoneNumber || "",
        },
        pickupAddress: {
          country: initialData.pickupAddress?.country || "IN",
          state: initialData.pickupAddress?.state || "",
          city: initialData.pickupAddress?.city || "",
          addressLine1: initialData.pickupAddress?.addressLine1 || "",
          addressLine2: initialData.pickupAddress?.addressLine2 || "",
          phoneNumber: initialData.pickupAddress?.phoneNumber || "",
        },
      })
    }
  }, [initialData, form])

  // Update billing states when billing country changes
  useEffect(() => {
    const countryCode = form.watch("billingAddress.country")
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode)
      setBillingStates(
        states.map((state) => ({
          id: state.isoCode,
          name: state.name,
        })),
      )
      // Reset state and city when country changes
      if (form.getValues("billingAddress.state")) {
        form.setValue("billingAddress.state", "")
        form.setValue("billingAddress.city", "")
        setBillingCities([])
      }
    }
  }, [form.watch("billingAddress.country"), form])

  // Update billing cities when billing state changes
  useEffect(() => {
    const countryCode = form.watch("billingAddress.country")
    const stateCode = form.watch("billingAddress.state")
    if (countryCode && stateCode) {
      const cities = City.getCitiesOfState(countryCode, stateCode)
      setBillingCities(
        cities.map((city) => ({
          id: city.name,
          name: city.name,
        })),
      )
      // Reset city when state changes
      if (form.getValues("billingAddress.city")) {
        form.setValue("billingAddress.city", "")
      }
    }
  }, [form.watch("billingAddress.state"), form])

  // Update pickup states when pickup country changes
  useEffect(() => {
    const countryCode = form.watch("pickupAddress.country")
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode)
      setPickupStates(
        states.map((state) => ({
          id: state.isoCode,
          name: state.name,
        })),
      )
      // Reset state and city when country changes
      if (form.getValues("pickupAddress.state")) {
        form.setValue("pickupAddress.state", "")
        form.setValue("pickupAddress.city", "")
        setPickupCities([])
      }
    }
  }, [form.watch("pickupAddress.country"), form])

  // Update pickup cities when pickup state changes
  useEffect(() => {
    const countryCode = form.watch("pickupAddress.country")
    const stateCode = form.watch("pickupAddress.state")
    if (countryCode && stateCode) {
      const cities = City.getCitiesOfState(countryCode, stateCode)
      setPickupCities(
        cities.map((city) => ({
          id: city.name,
          name: city.name,
        })),
      )
      // Reset city when state changes
      if (form.getValues("pickupAddress.city")) {
        form.setValue("pickupAddress.city", "")
      }
    }
  }, [form.watch("pickupAddress.state"), form])

  async function onSubmit(data: AddressDetails) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()

      // Add billing address fields
      Object.entries(data.billingAddress).forEach(([key, value]) => {
        if (value) formData.append(`billingAddress.${key}`, value)
      })

      // Add pickup address fields
      Object.entries(data.pickupAddress).forEach(([key, value]) => {
        if (value) formData.append(`pickupAddress.${key}`, value)
      })

      console.log("Submitting address form data")
      const result = await saveAddressDetails(formData)

      if (result.success) {
        toast.success(result.message || "Address details saved successfully")
        setIsEditing(false) // Set to view mode after successful save

        // Call the onSaved callback if provided
        if (onSaved) {
          onSaved()
        }
      } else {
        toast.error(result.error || "Failed to save address details")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const AddressFields = ({ prefix }: { prefix: "billingAddress" | "pickupAddress" }) => {
    const states = prefix === "billingAddress" ? billingStates : pickupStates
    const cities = prefix === "billingAddress" ? billingCities : pickupCities

    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={`${prefix}.country`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Country<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <LocationDropdown
                  options={countryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Country"
                  disabled={!isEditing}
                  emptyMessage="No countries found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                State<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <LocationDropdown
                  options={states}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select State"
                  disabled={!isEditing || !form.getValues(`${prefix}.country`)}
                  emptyMessage="No states found for selected country."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                City<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                {cities.length > 0 ? (
                  <LocationDropdown
                    options={cities}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select City"
                    disabled={!isEditing || !form.getValues(`${prefix}.state`)}
                    emptyMessage="No cities found for selected state."
                  />
                ) : (
                  <Input
                    placeholder="Enter city name"
                    {...field}
                    disabled={!isEditing || !form.getValues(`${prefix}.state`)}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.addressLine1`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Address Line 1<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main Street" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.addressLine2`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apartment 4B" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.phoneNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone Number<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9876543210" {...field} disabled={!isEditing} type="tel" maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form id="addresses-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium mb-4">Add Billing Address</h3>
            <AddressFields prefix="billingAddress" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Add Pickup Address</h3>
            <AddressFields prefix="pickupAddress" />
          </div>
        </div>

        <div className="flex space-x-4">
          {!isEditing && initialData && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}

          {isEditing && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
