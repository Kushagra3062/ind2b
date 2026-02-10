"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ContactDetails } from "@/types/profile"
import { saveContactDetails } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Loader2, Edit } from "lucide-react"

const contactSchema = z.object({
  contactName: z.string()
    .min(2, "Contact name is required")
    .regex(/^[A-Za-z\s\.\'\-]+$/, "Contact name can only contain letters, spaces, periods, apostrophes, and hyphens"),
  
  phoneNumber: z.string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  
  emailId: z.string()
    .email("Please enter a valid email address"),
  
  pickupTime: z.string().optional(),
});

interface ContactFormProps {
  initialData?: ContactDetails
  onSaved?: () => void
}

export function ContactForm({ initialData, onSaved }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Log the initialData to help debug
  console.log("ContactForm initialData:", initialData)
  console.log("ContactForm isEditing:", isEditing)
  console.log("ContactForm has initialData:", !!initialData)
  console.log("ContactForm initialData keys:", initialData ? Object.keys(initialData) : [])

  const form = useForm<ContactDetails>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactName: "",
      phoneNumber: "",
      emailId: "",
      pickupTime: "",
      ...initialData,
    },
  })

  // Initialize isEditing state and form data when component mounts or initialData changes
  useEffect(() => {
    console.log("ContactForm useEffect - initialData changed:", initialData)
    
    if (initialData && Object.keys(initialData).length > 0) {
      console.log("Resetting form with initialData:", initialData)
      form.reset({
        contactName: initialData.contactName || "",
        phoneNumber: initialData.phoneNumber || "",
        emailId: initialData.emailId || "",
        pickupTime: initialData.pickupTime || "",
      })
      
      // If we have data, start in read-only mode
      setIsEditing(false)
    } else {
      console.log("No initialData, starting in edit mode")
      // If no data, start in edit mode
      setIsEditing(true)
    }
  }, [initialData, form])

  async function onSubmit(data: ContactDetails) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          // Only append if value exists
          formData.append(key, value)
        }
      })

      const result = await saveContactDetails(formData)

      if (result.success) {
        toast.success(result.message || "Contact details saved successfully")
        setIsEditing(false)

        // Call the onSaved callback if provided
        if (onSaved) {
          onSaved()
        }
      } else {
        toast.error(result.error || "Failed to save contact details")
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
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contact Name<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone Number<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 9876543210" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email ID<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., john.doe@example.com" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Pickup Time <span className="text-xs text-gray-500">(Optional)</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="9AM-12PM">9 AM - 12 PM</SelectItem>
                    <SelectItem value="12PM-3PM">12 PM - 3 PM</SelectItem>
                    <SelectItem value="3PM-6PM">3 PM - 6 PM</SelectItem>
                    <SelectItem value="6PM-9PM">6 PM - 9 PM</SelectItem>
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
