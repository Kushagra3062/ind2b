"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Seller } from "@/types/seller"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  // Business Details
  legalEntityName: z.string().min(1, { message: "Legal Entity Name is required" }),
  tradeName: z.string().min(1, { message: "Trade Name is required" }),
  gstin: z.string().min(15, { message: "GSTIN must be 15 characters" }).max(15),
  businessCountry: z.string().min(1, { message: "Country is required" }),
  pincode: z.string().min(6, { message: "Pincode must be 6 digits" }).max(6),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
  businessEntityType: z.string().min(1, { message: "Business Entity Type is required" }),

  // Contact Details
  name: z.string().min(1, { message: "Name is required" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be 10 digits" }).max(10),
  emailId: z.string().email({ message: "Invalid email address" }),
  pickupTime: z.string().optional(),

  // Category and Brand
  category: z.string().min(1, { message: "Category is required" }),
  brandRequired: z.string().optional(),

  // Billing Address
  billingCountry: z.string().min(1, { message: "Country is required" }),
  billingState: z.string().min(1, { message: "State is required" }),
  billingCity: z.string().min(1, { message: "City is required" }),
  billingAddressLine1: z.string().min(1, { message: "Address Line 1 is required" }),
  billingAddressLine2: z.string().optional(),
  billingAddressLine3: z.string().optional(),

  // Pickup Address
  pickupCountry: z.string().optional(),
  pickupState: z.string().optional(),
  pickupCity: z.string().optional(),
  pickupAddressLine1: z.string().optional(),
  pickupAddressLine2: z.string().optional(),
  pickupAddressLine3: z.string().optional(),

  // Bank Details
  accountHolderName: z.string().min(1, { message: "Account Holder Name is required" }),
  accountNumber: z.string().min(1, { message: "Account Number is required" }),
  ifscCode: z.string().min(11, { message: "IFSC Code must be 11 characters" }).max(11),
  bankName: z.string().min(1, { message: "Bank Name is required" }),
  bankCity: z.string().min(1, { message: "City is required" }),
  accountType: z.enum(["Savings", "Current", "Other"], {
    required_error: "Account Type is required",
  }),
})

interface AddSellerFormProps {
  onSuccess?: (newSeller: Seller) => void
}

export function AddSellerForm({ onSuccess }: AddSellerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalEntityName: "",
      tradeName: "",
      gstin: "",
      businessCountry: "",
      pincode: "",
      state: "",
      city: "",
      businessEntityType: "",
      name: "",
      phoneNumber: "",
      emailId: "",
      pickupTime: "",
      category: "",
      brandRequired: "",
      billingCountry: "",
      billingState: "",
      billingCity: "",
      billingAddressLine1: "",
      billingAddressLine2: "",
      billingAddressLine3: "",
      pickupCountry: "",
      pickupState: "",
      pickupCity: "",
      pickupAddressLine1: "",
      pickupAddressLine2: "",
      pickupAddressLine3: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      bankCity: "",
      accountType: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add seller")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: "New seller added successfully",
      })

      const newSeller: Seller = {
        id: values.gstin,
        name: values.name,
        email: values.emailId,
        address: `${values.billingAddressLine1}, ${values.billingCity}, ${values.billingState}, ${values.billingCountry}`,
        registeredDate: new Date(),
        totalSales: "$0",
        status: "Pending",
      }

      if (onSuccess) {
        onSuccess(newSeller)
      } else {
        router.push("/admin/sellers")
      }
    } catch (error: any) {
      console.error("Error adding seller:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add seller. Please try again.",
        
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <p className="text-sm text-muted-foreground">Fields marked with an asterisk (*) are required.</p>
        {/* Business Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="legalEntityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Legal Entity Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Trade Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    GSTIN <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pincode <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessEntityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Business Entity Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Id <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Time</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Category and Brand */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Category and Brand</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brandRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address Line 1 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingAddressLine3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 3</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pickup Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pickup Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pickupCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupAddressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupAddressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupAddressLine3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 3</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account Holder Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ifscCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    IFSC Code <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bank Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Current">Current</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/sellers")}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  )
}
