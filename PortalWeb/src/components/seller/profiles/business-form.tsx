"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BusinessDetails } from "@/types/profile"
import { saveBusinessDetails } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Loader2, Edit } from "lucide-react"

const businessSchema = z.object({
  legalEntityName: z
    .string()
    .min(2, "Legal entity name is required")
    .regex(/^[a-zA-Z0-9\s]+$/, "Legal entity name can only contain alphanumeric characters and spaces"),
  tradeName: z.string().min(2, "Trade name is required"),
  gstin: z.string().min(15, "Valid GSTIN required").max(15, "GSTIN must be 15 characters"),
  country: z.string().min(2, "Country is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  businessEntityType: z.string().min(2, "Business entity type is required"),
})

interface BusinessFormProps {
  initialData?: BusinessDetails
  onSaved?: () => void
  isPrefilledData?: boolean
}

export function BusinessForm({ initialData, onSaved, isPrefilledData = false }: BusinessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Log the initialData to help debug
  console.log("BusinessForm initialData:", initialData)
  console.log("BusinessForm isEditing:", isEditing)
  console.log("BusinessForm has initialData:", !!initialData)
  console.log("BusinessForm initialData keys:", initialData ? Object.keys(initialData) : [])

  const form = useForm<BusinessDetails>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      legalEntityName: "",
      tradeName: "",
      gstin: "",
      country: "",
      pincode: "",
      state: "",
      city: "",
      businessEntityType: "",
      ...initialData,
    },
  })

  // Initialize isEditing state and form data when component mounts or initialData changes
  useEffect(() => {
    console.log("BusinessForm useEffect - initialData changed:", initialData)
    console.log("BusinessForm isPrefilledData:", isPrefilledData)
    
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Resetting form with initialData:", initialData)
      form.reset({
        legalEntityName: initialData.legalEntityName || "",
        tradeName: initialData.tradeName || "",
        gstin: initialData.gstin || "",
        country: initialData.country || "",
        pincode: initialData.pincode || "",
        state: initialData.state || "",
        city: initialData.city || "",
        businessEntityType: initialData.businessEntityType || "",
      })
      
      // If data is prefilled from light form, start in edit mode
      // If data is real saved data, start in read-only mode
      setIsEditing(isPrefilledData)
    } else {
      console.log("No initialData, starting in edit mode")
      // If no data, start in edit mode
      setIsEditing(true)
    }
  }, [initialData, form, isPrefilledData])

  async function onSubmit(data: BusinessDetails) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const result = await saveBusinessDetails(formData)

      if (result.success) {
        toast.success(result.message || "Business details saved successfully")
        setIsEditing(false)

        // Call the onSaved callback if provided
        if (onSaved) {
          onSaved()
        }
      } else {
        toast.error(result.error || "Failed to save business details")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="legalEntityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Legal Entity Name<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ABC Enterprises Pvt. Ltd." {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tradeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Trade Name<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ABC Store" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gstin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  GSTIN<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 22AAAAA0000A1Z5" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., India" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pincode<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 400001" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Maharashtra" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mumbai" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="businessEntityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Business Entity Type<span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="LLP">Limited Liability Partnership (LLP)</SelectItem>
                    <SelectItem value="Private Limited">Private Limited Company</SelectItem>
                    <SelectItem value="Public Limited">Public Limited Company</SelectItem>
                    <SelectItem value="HUF">Hindu Undivided Family (HUF)</SelectItem>
                    <SelectItem value="Society">Society</SelectItem>
                    <SelectItem value="Trust">Trust</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
