"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Plus, Upload, X, Save, AlertCircle, Calculator } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import debounce from "lodash/debounce"
import { useRouter } from 'next/navigation'

// Define the product schema without GST
const productSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  model: z.string().optional(),
  description: z.string().optional(),
  category_id: z.number().optional(),
  sub_category_id: z.number().optional(),
  units: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  image_link: z.string().optional(),
  stock: z.number().min(1, "Stock is required"),
  price: z.number().min(1, "Price is required"),
  discount: z.number().optional(),
  SKU: z.string().min(1, "SKU is required"),
  seller_name: z.string().min(1, "Seller name is required"),
  emailId: z.string().email("Invalid email format").min(1, "Seller email is required"),
  location: z.string().min(1, "Location is required"),
  category_name: z.string().min(1, "Category is required"),
  sub_category_name: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: number
  name: string
  sub_categories: { id: number; name: string }[]
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData, isDraft: boolean) => void
  onCancel: () => void
  initialData?: Partial<ProductFormData>
  productId?: number
}

export default function ProductForm({ onSubmit, onCancel, initialData, productId }: ProductFormProps) {
  const [images, setImages] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newSubCategoryName, setNewSubCategoryName] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [sellerEmail, setSellerEmail] = useState<string | null>(null)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)
  const [emailError, setEmailError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      title: "",
      model: "",
      description: "",
      category_id: undefined,
      sub_category_id: undefined,
      units: "",
      weight: undefined,
      dimensions: {
        length: undefined,
        width: undefined,
        height: undefined,
      },
      image_link: undefined,
      stock: undefined,
      price: undefined,
      discount: undefined,
      SKU: "",
      seller_name: "",
      emailId: "",
      location: "",
      category_name: "",
      sub_category_name: "",
    },
  })

  const selectedCategoryId = watch("category_id")
  const selectedCategoryName = watch("category_name")
  const price = watch("price") || 0
  const discount = watch("discount") || 0

  // Calculate total price with discount only
  const calculateTotalPrice = () => {
    const basePrice = price || 0
    const discountAmount = (basePrice * (discount || 0)) / 100
    const totalPrice = basePrice - discountAmount
    return {
      basePrice,
      discountAmount,
      totalPrice,
    }
  }

  const priceCalculation = calculateTotalPrice()

  // Fetch categories on component mount
  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched categories:", data)
        setCategories(data)
      } else {
        console.error("Failed to fetch categories")
        toast({
          title: "Error",
          description: "Failed to load categories. Please refresh the page.",
        })
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please refresh the page.",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find((cat) => cat.id === selectedCategoryId)
      if (category) {
        setSubCategories(category.sub_categories || [])
      }
    } else {
      setSubCategories([])
    }
  }, [selectedCategoryId, categories])

  // Initialize images if initialData has image_link
  useEffect(() => {
    if (initialData?.image_link) {
      setImages([initialData.image_link])
    }
  }, [initialData])

  // Auto-save functionality
  const autoSave = useCallback(
    debounce(async (formData: ProductFormData) => {
      if (!isDirty) return

      setIsSaving(true)
      try {
        const payload = {
          ...formData,
          is_draft: true,
          product_id: productId,
        }

        const response = await fetch("/api/seller/products/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          setLastSaved(new Date())
        } else {
          console.error("Failed to auto-save draft")
        }
      } catch (error) {
        console.error("Error auto-saving draft:", error)
      } finally {
        setIsSaving(false)
      }
    }, 5000),
    [isDirty, productId],
  )

  // Watch form changes for auto-save
  const formValues = watch()
  useEffect(() => {
    autoSave(formValues)

    // Cleanup
    return () => {
      autoSave.cancel()
    }
  }, [formValues, autoSave])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && images.length < 4) {
      Array.from(files).forEach((file) => {
        if (images.length < 4) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setImages((prev) => [...prev, reader.result as string])
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    if (selectedImageIndex >= index) {
      setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
    }
  }

  const handleFormSubmit = async (data: ProductFormData, isDraft = false) => {
    setIsLoading(true)

    try {
      // Debug: Log the form data
      console.log("Form data before submission:", data)

      // Make sure emailId is included in the form data
      if (!data.emailId) {
        toast({
          title: "Error",
          description: "Seller email is required. Please enter your email address.",
        })
        setIsLoading(false)
        return
      }

      // Add the primary image to the form data
      const formData = {
        ...data,
        image_link: images.length > 0 ? images[0] : undefined,
        is_draft: isDraft,
        // Explicitly include emailId to ensure it's sent to the server
        emailId: data.emailId,
      }

      // Debug: Log the final form data
      console.log("Final form data to submit:", formData)
      console.log("Email ID being submitted:", formData.emailId)

      // Submit the form data
      await onSubmit(formData, isDraft)

      if (!isDraft) {
        toast({
          title: "Product saved successfully",
          description: "Your product has been published to the store.",
        })
      } else {
        toast({
          title: "Draft saved",
          description: "Your product draft has been saved.",
        })
      }

      // Reset form if it was a successful submission
      if (!isDraft) {
        reset()
        setImages([])
      }
    } catch (error) {
      console.error("Error submitting product:", error)
      toast({
        title: "Error saving product",
        description: "There was an error saving your product. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
      })
      return
    }

    setAddingCategory(true)
    try {
      console.log("Adding new category:", newCategoryName)
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: newCategoryName }),
      })

      console.log("Category response status:", response.status)

      if (response.ok) {
        const newCategory = await response.json()
        console.log("New category created:", newCategory)
        setCategories((prev) => [...prev, newCategory])
        setValue("category_name", newCategory.name)
        setValue("category_id", newCategory.id)
        setValue("sub_category_name", "")
        setValue("sub_category_id", undefined)
        setIsAddCategoryOpen(false)
        setNewCategoryName("")
        toast({
          title: "Success",
          description: "Category added successfully",
        })
      } else {
        const error = await response.json()
        console.error("Failed to add category:", error)
        toast({
          title: "Error",
          description: error.error || "Failed to add category",
        })
      }
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
      })
    } finally {
      setAddingCategory(false)
    }
  }

  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim() || !selectedCategoryId) {
      toast({
        title: "Error",
        description: "Subcategory name cannot be empty and a parent category must be selected",
      })
      return
    }

    setAddingCategory(true)
    try {
      console.log("Adding new subcategory:", {
        parentCategoryId: selectedCategoryId,
        subCategoryName: newSubCategoryName,
      })

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentCategoryId: selectedCategoryId,
          subCategoryName: newSubCategoryName,
        }),
      })

      console.log("Subcategory response status:", response.status)

      if (response.ok) {
        const updatedCategory = await response.json()
        console.log("Updated category with new subcategory:", updatedCategory)

        // Update the categories list
        setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))

        // Update subcategories for the current category
        setSubCategories(updatedCategory.sub_categories || [])

        // Find the newly added subcategory
        const newSubCategory = updatedCategory.sub_categories.find((sub: any) => sub.name === newSubCategoryName)

        if (newSubCategory) {
          setValue("sub_category_name", newSubCategory.name)
          setValue("sub_category_id", newSubCategory.id)
        }

        setIsAddSubCategoryOpen(false)
        setNewSubCategoryName("")
        toast({
          title: "Success",
          description: "Subcategory added successfully",
        })
      } else {
        const error = await response.json()
        console.error("Failed to add subcategory:", error)
        toast({
          title: "Error",
          description: error.error || "Failed to add subcategory",
        })
      }
    } catch (error) {
      console.error("Error adding subcategory:", error)
      toast({
        title: "Error",
        description: "Failed to add subcategory. Please try again.",
      })
    } finally {
      setAddingCategory(false)
    }
  }

  if (emailError) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Not Complete</AlertTitle>
          <AlertDescription>
            {emailError}. You need to complete your profile with contact information before adding products.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/seller/profile")} className="mt-4">
          Complete Profile
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{productId ? "Edit Product" : "Add New Product"}</h2>
          <p className="text-muted-foreground mt-1">
            {isSaving
              ? "Saving draft..."
              : lastSaved
                ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                : "Fill in the product details below"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => handleFormSubmit(watch(), true)} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Please enter the same email address that you used in your profile management. Products are linked to your
          seller account through this email.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit((data) => handleFormSubmit(data, false))} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className="text-base">
                    Product Title*
                  </Label>
                  <Input
                    {...register("title")}
                    id="title"
                    placeholder="Enter product title"
                    className="bg-white h-10"
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="SKU" className="text-base">
                    SKU Code*
                  </Label>
                  <Input {...register("SKU")} id="SKU" placeholder="e.g., ABC-123-XYZ" className="bg-white h-10" />
                  {errors.SKU && <p className="text-red-500 text-sm">{errors.SKU.message}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="model" className="text-base">
                    Model
                  </Label>
                  <Input {...register("model")} id="model" placeholder="e.g., XPS-15" className="bg-white h-10" />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="description" className="text-base">
                    Product Description
                  </Label>
                  <Textarea
                    {...register("description")}
                    id="description"
                    placeholder="Enter product description"
                    className="min-h-[100px] bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Images</h3>
              <div className="space-y-4">
                {images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <div className="relative w-full aspect-video">
                        <img
                          src={images[selectedImageIndex] || "/placeholder.svg"}
                          alt={`Product preview ${selectedImageIndex + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 h-[80px] flex-wrap">
                      {images.map((img, index) => (
                        <div key={index} className="relative w-[80px] h-[80px]">
                          <div
                            className={`relative w-full h-full cursor-pointer ${
                              selectedImageIndex === index ? "ring-2 ring-[#10b981]" : "ring-1 ring-gray-200"
                            }`}
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {images.length < 4 && (
                        <label
                          htmlFor="imageUpload"
                          className="w-[80px] h-[80px] border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-[#10b981] transition-colors"
                        >
                          <Plus className="w-6 h-6 text-[#10b981]" />
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg">
                      <label
                        htmlFor="imageUpload"
                        className="cursor-pointer flex flex-col items-center justify-center h-[200px]"
                      >
                        <Upload className="h-6 w-6 text-[#10b981] mb-2" />
                        <span className="text-[#10b981] font-medium text-sm">Click to Upload</span>
                        <span className="text-xs text-muted-foreground">or drag and drop</span>
                        <span className="text-xs text-muted-foreground">(Max file size: 25 MB)</span>
                      </label>
                    </div>
                  </div>
                )}
                <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="price" className="text-base">
                    Price*
                  </Label>
                  <Input
                    {...register("price", { valueAsNumber: true })}
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    className="bg-white h-10"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="discount" className="text-base">
                    Discount (%)
                  </Label>
                  <Input
                    {...register("discount", { valueAsNumber: true })}
                    id="discount"
                    type="number"
                    placeholder="Enter discount percentage"
                    className="bg-white h-10"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Price Calculation Display */}
                {price > 0 && (
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Price Calculation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span>₹{priceCalculation.basePrice.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Discount ({discount}%):</span>
                            <span>-₹{priceCalculation.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Final Price:</span>
                          <span>₹{priceCalculation.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory & Units</h3>
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="stock" className="text-base">
                    Stock*
                  </Label>
                  <Input
                    {...register("stock", { valueAsNumber: true })}
                    id="stock"
                    type="number"
                    placeholder="Enter available quantity"
                    className="bg-white h-10"
                    min="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="units" className="text-base">
                    Units
                  </Label>
                  <Input
                    {...register("units")}
                    id="units"
                    placeholder="e.g., kg, pcs, etc."
                    className="bg-white h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dimensions & Weight</h3>
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="weight" className="text-base">
                      Weight (kg)
                    </Label>
                    <Input
                      {...register("weight", { valueAsNumber: true })}
                      id="weight"
                      type="number"
                      placeholder="Enter weight"
                      className="bg-white h-10"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="dimensions.length">Length (cm)</Label>
                      <Input
                        {...register("dimensions.length", { valueAsNumber: true })}
                        id="dimensions.length"
                        type="number"
                        placeholder="Length"
                        className="bg-white h-10"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="dimensions.width">Width (cm)</Label>
                      <Input
                        {...register("dimensions.width", { valueAsNumber: true })}
                        id="dimensions.width"
                        type="number"
                        placeholder="Width"
                        className="bg-white h-10"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="dimensions.height">Height (cm)</Label>
                      <Input
                        {...register("dimensions.height", { valueAsNumber: true })}
                        id="dimensions.height"
                        type="number"
                        placeholder="Height"
                        className="bg-white h-10"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="seller_name" className="text-base">
                      Seller Name*
                    </Label>
                    <Input
                      {...register("seller_name")}
                      id="seller_name"
                      placeholder="Enter seller name"
                      className="bg-white h-10"
                    />
                    {errors.seller_name && <p className="text-red-500 text-sm">{errors.seller_name.message}</p>}
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="emailId" className="text-base">
                      Seller Email*
                    </Label>
                    <Input
                      {...register("emailId")}
                      id="emailId"
                      placeholder="Enter seller email"
                      className="bg-white h-10"
                    />
                    {errors.emailId && <p className="text-red-500 text-sm">{errors.emailId.message}</p>}
                    <p className="text-sm text-muted-foreground">
                      Please use the same email address that you provided during profile management.
                    </p>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="location" className="text-base">
                      Location*
                    </Label>
                    <Input
                      {...register("location")}
                      id="location"
                      placeholder="Enter location"
                      className="bg-white h-10"
                    />
                    {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category</h3>
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="category_name" className="text-base">
                      Category*
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          const category = categories.find((cat) => cat.name === value)
                          if (category) {
                            setValue("category_name", value)
                            setValue("category_id", category.id)
                            // Reset subcategory when category changes
                            setValue("sub_category_name", "")
                            setValue("sub_category_id", undefined)
                          }
                        }}
                        value={watch("category_name") || ""}
                        disabled={isLoadingCategories}
                      >
                        <SelectTrigger className="bg-white h-10 flex-1">
                          <SelectValue
                            placeholder={isLoadingCategories ? "Loading categories..." : "Select Category"}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-categories" value="no-categories-placeholder" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 bg-transparent"
                        onClick={() => setIsAddCategoryOpen(true)}
                        disabled={isLoadingCategories}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {errors.category_name && <p className="text-red-500 text-sm">{errors.category_name.message}</p>}
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="sub_category_name" className="text-base">
                      Sub Category
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          const subCategory = subCategories.find((subCat) => subCat.name === value)
                          if (subCategory) {
                            setValue("sub_category_name", value)
                            setValue("sub_category_id", subCategory.id)
                          }
                        }}
                        value={watch("sub_category_name") || ""}
                        disabled={!selectedCategoryId || subCategories.length === 0}
                      >
                        <SelectTrigger className="bg-white h-10 flex-1">
                          <SelectValue
                            placeholder={!selectedCategoryId ? "Select a category first" : "Select Sub Category"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategories.length > 0 ? (
                            subCategories.map((subCategory) => (
                              <SelectItem key={subCategory.id} value={subCategory.name}>
                                {subCategory.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-subcategories" value="no-subcategories-placeholder" disabled>
                              {selectedCategoryId ? "No subcategories available" : "Select a category first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 bg-transparent"
                        onClick={() => setIsAddSubCategoryOpen(true)}
                        disabled={!selectedCategoryId}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#10b981] hover:bg-[#10b981]/90 text-white" disabled={isLoading}>
            {isLoading ? "Saving..." : "Submit Product"}
          </Button>
        </div>
      </form>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newCategoryName">Category Name</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={addingCategory}>
              {addingCategory ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcategory to {selectedCategoryName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newSubCategoryName">Subcategory Name</Label>
              <Input
                id="newSubCategoryName"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="Enter subcategory name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubCategory} disabled={addingCategory}>
              {addingCategory ? "Adding..." : "Add Subcategory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
