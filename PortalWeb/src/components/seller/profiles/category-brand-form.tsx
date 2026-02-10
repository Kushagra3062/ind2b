"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { saveCategoryAndBrand } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Loader2, Edit } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

// Define types
export interface CategoryBrandDetails {
  categories: string[]
  authorizedBrands: string
}

// Define CheckboxListProps
interface CheckboxListProps {
  selectedValues: string[]
  onChange: (values: string[]) => void
  label: string
  options: string[]
  disabled?: boolean
}

// Create CheckboxList component
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px]">
        {options.map((option) => (
          <div
            key={option}
            className={`flex items-center space-x-2 p-1 rounded-md transition-colors ${
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

const categorySchema = z.object({
  categories: z.array(z.string()).min(1, "Select at least one category"),
  authorizedBrands: z.string().min(1, "Please enter the brands you are authorized to sell"),
})

// Updated categories list
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

interface CategoryBrandFormProps {
  initialData?: CategoryBrandDetails
  onSaved?: () => void
  isPrefilledData?: boolean
}

export function CategoryBrandForm({ initialData, onSaved, isPrefilledData = false }: CategoryBrandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If data is prefilled from light form, start in edit mode
  // If data is real saved data, start in read-only mode
  // If no data, start in edit mode
  const [isEditing, setIsEditing] = useState(!initialData || isPrefilledData)

  // Log the initialData to help debug
  console.log("CategoryBrandForm initialData:", initialData)

  const form = useForm<CategoryBrandDetails>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categories: initialData?.categories || [],
      authorizedBrands: initialData?.authorizedBrands || "",
    },
  })

  // Force form reset when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log("Resetting form with initialData:", initialData)
      form.reset({
        categories: initialData.categories || [],
        authorizedBrands: initialData.authorizedBrands || "",
      })
    }
  }, [initialData, form])

  async function onSubmit(data: CategoryBrandDetails) {
    try {
      setIsSubmitting(true)

      const formData = new FormData()

      // Add each category to the FormData
      data.categories.forEach((category) => {
        formData.append("categories", category)
      })

      // Add authorized brands as a string
      formData.append("authorizedBrands", data.authorizedBrands)

      const result = await saveCategoryAndBrand(formData)

      if (result.success) {
        toast.success(result.message || "Category and brand details saved successfully")
        setIsEditing(false) // Set to view mode after successful save

        // Call the onSaved callback if provided
        if (onSaved) {
          onSaved()
        }
      } else {
        toast.error(result.error || "Failed to save category and brand details")
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base font-semibold">
                  Categories<span className="text-red-500">*</span>
                </FormLabel>
                <p className="text-sm text-gray-500 -mt-2"></p>
                <FormControl>
                  <CheckboxList
                    options={availableCategories}
                    selectedValues={field.value}
                    onChange={field.onChange}
                    label="Select categories you want to sell in"
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authorizedBrands"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base font-semibold">
                  Authorized Brands<span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter the brands you are authorized to sell (comma separated)."
                    {...field}
                    disabled={!isEditing}
                    className="w-full"
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
