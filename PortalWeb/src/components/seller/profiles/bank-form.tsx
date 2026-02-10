"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "./file-upload"
import { saveBankDetails } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Loader2, Edit } from "lucide-react"

// Define types
export type AccountType = "Savings" | "Current"

export interface BankDetails {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branch: string
  city: string
  accountType: AccountType
  bankLetterUrl: string
}

const bankSchema = z.object({
  accountHolderName: z.string()
    .min(1, "Account holder name is required")
    .regex(/^[A-Za-z\s\.\'\-]+$/, "Account holder name can only contain letters, spaces, periods, apostrophes, and hyphens"),
  
  accountNumber: z.string()
    .regex(/^\d{9,}$/, "Account number must be at least 9 digits"),
  
  ifscCode: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in format: 4 letters, 0, then 6 alphanumeric characters"),
  bankName: z.string().min(2, "Bank name is required"),
  branch: z.string().min(2, "Branch name is required"),
  city: z.string().min(2, "City is required"),
  accountType: z.enum(["Savings", "Current"] as const),
  bankLetterUrl: z.string().optional(),
})

// Function to fetch bank details from IFSC code
async function fetchBankDetails(ifscCode: string) {
  try {
    const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`)
    if (!response.ok) {
      throw new Error("Invalid IFSC code")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching bank details:", error)
    return null
  }
}

interface BankFormProps {
  initialData?: BankDetails
  onSaved?: () => void
}

export function BankForm({ initialData, onSaved }: BankFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingIfsc, setIsLoadingIfsc] = useState(false)

  // Simplified condition: Just check if initialData exists
  const [isEditing, setIsEditing] = useState(!initialData)

  // Log the initialData to help debug
  console.log("BankForm initialData:", initialData)

  const defaultValues = {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    city: "",
    accountType: "Savings" as AccountType,
    bankLetterUrl: "",
  }

  const form = useForm<BankDetails>({
    resolver: zodResolver(bankSchema),
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
        accountHolderName: initialData.accountHolderName || "",
        accountNumber: initialData.accountNumber || "",
        ifscCode: initialData.ifscCode || "",
        bankName: initialData.bankName || "",
        branch: initialData.branch || "",
        city: initialData.city || "",
        accountType: initialData.accountType || "Savings",
        bankLetterUrl: initialData.bankLetterUrl || "",
      })
    }
  }, [initialData, form])

  // Watch the IFSC code field to auto-fill bank details
  const ifscCode = form.watch("ifscCode")

  useEffect(() => {
    // Only proceed if IFSC code is complete (11 characters) and form is in editing mode
    if (ifscCode && ifscCode.length === 11 && isEditing) {
      const fetchDetails = async () => {
        setIsLoadingIfsc(true)
        try {
          const bankData = await fetchBankDetails(ifscCode)
          if (bankData) {
            // Auto-fill the form fields
            form.setValue("bankName", bankData.BANK || "")
            form.setValue("branch", bankData.BRANCH || "")
            form.setValue("city", bankData.CITY || "")
            toast.success("Bank details fetched successfully")
          } else {
            toast.error("Could not fetch bank details. Please enter manually.")
          }
        } catch (error) {
          console.error("Error in fetching bank details:", error)
          toast.error("Error fetching bank details. Please enter manually.")
        } finally {
          setIsLoadingIfsc(false)
        }
      }

      fetchDetails()
    }
  }, [ifscCode, form, isEditing])

  async function onSubmit(data: BankDetails) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()

      // Add all string fields
      formData.append("accountHolderName", data.accountHolderName)
      formData.append("accountNumber", data.accountNumber)
      formData.append("ifscCode", data.ifscCode)
      formData.append("bankName", data.bankName)
      formData.append("branch", data.branch)
      formData.append("city", data.city)
      formData.append("accountType", data.accountType)

      // Always append bankLetterUrl, even if it's empty
      formData.append("bankLetterUrl", data.bankLetterUrl || "")

      const result = await saveBankDetails(formData)

      if (result.success) {
        toast.success(result.message || "Bank details saved successfully")
        setIsEditing(false) // Set to view mode after successful save

        // Call the onSaved callback if provided
        if (onSaved) {
          onSaved()
        }
      } else {
        toast.error(result.error || "Failed to save bank details")
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
            name="accountHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Account Holder Name<span className="text-red-500">*</span>
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
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Account Number<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 12345678901234" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ifscCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  IFSC Code<span className="text-red-500">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="e.g., SBIN0001234"
                      {...field}
                      onChange={(e) => {
                        // Convert to uppercase
                        const value = e.target.value.toUpperCase()
                        field.onChange(value)
                      }}
                      maxLength={11}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  {isLoadingIfsc && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Enter a valid IFSC code to auto-fill bank details</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bank Name<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., State Bank of India" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Branch<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Branch" {...field} disabled={!isEditing} />
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
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Account Type<span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankLetterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Letter (Optional)</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5}
                    label="Upload bank letter"
                    disabled={!isEditing}
                  />
                </FormControl>
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
