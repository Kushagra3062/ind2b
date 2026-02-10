"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"


const availableCategories = [
  "Abrasives",
  "Agriculture & Farming",
  "Automotive",
  "Bearings & Power Transmission",
  "Cleaning & Housekeeping",
  "Cutting Tools & Machining",
  "Electronic Components",
  "Fasteners",
  "Food Processing Machinery",
  "Hand Tools",
  "Hardware",
  "Health & Nutrition",
  "Hose, Tube & Fittings",
  "Hydraulics",
  "Kitchen and Pantry Supplies",
  "Lab Supplies",
  "LED & Lighting",
  "Material Handling",
  "Measurement & Testing",
  "Medical Supplies",
  "Oils & Lubricants",
  "Outdoor & Recreational Supplies",
  "Packaging Material & Supplies",
  "Personal Hygiene",
  "Paints & Coatings",
  "Plumbing & Bathroom Fittings",
  "Pneumatics",
  "Security",
  "Seals & Gaskets",
  "Solar",
  "Tapes, Adhesives & Sealants",
  "Welding & Soldering",
]

const lightOnboardingSchema = z.object({
  businessName: z.string().min(2, "Legal entity name is required"),
  gstNumber: z.string().min(15, "Valid GST number required").max(15, "GST number must be 15 characters"),
  address: z.string().min(10, "Address is required"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
})

interface LightSellerFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface CheckboxListProps {
  selectedValues: string[]
  onChange: (values: string[]) => void
  label: string
  options: string[]
  disabled?: boolean
}

function CheckboxList({ selectedValues, onChange, label, options, disabled = false }: CheckboxListProps) {
  const handleCheckboxChange = (value: string) => {
    if (disabled) return

    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map((option) => (
          <div
            key={option}
            className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
              selectedValues.includes(option)
                ? "bg-orange-50 border border-orange-200"
                : "hover:bg-gray-50 border border-transparent"
            }`}
          >
            <Checkbox
              id={option}
              checked={selectedValues.includes(option)}
              onCheckedChange={() => handleCheckboxChange(option)}
              disabled={disabled}
              className={selectedValues.includes(option) ? "text-orange-600 border-orange-600" : ""}
            />
            <label
              htmlFor={option}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                disabled ? "opacity-70" : ""
              } ${selectedValues.includes(option) ? "text-orange-700" : ""}`}
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LightSellerForm({ onSuccess, onCancel }: LightSellerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof lightOnboardingSchema>>({
    resolver: zodResolver(lightOnboardingSchema),
    defaultValues: {
      businessName: "",
      gstNumber: "",
      address: "",
      categories: [],
    },
  })

  async function onSubmit(values: z.infer<typeof lightOnboardingSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/seller/light-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to submit light onboarding")
      }

      onSuccess()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Register as Seller</h2>
        <p className="text-gray-600">Complete these basic details to get started</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Entity Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your legal entity name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Number *</FormLabel>
                <FormControl>
                  <Input placeholder="22AAAAA0000A1Z5" {...field} maxLength={15} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories *</FormLabel>
                <FormControl>
                  <CheckboxList
                    options={availableCategories}
                    selectedValues={field.value}
                    onChange={field.onChange}
                    label="Select categories you want to sell in"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Complete Setup"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}