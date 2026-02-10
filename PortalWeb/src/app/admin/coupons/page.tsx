"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Coupon {
  _id: string
  couponName: string
  couponCode: string
  discountType: "percentage" | "fixed"
  discountValue: number
  validFrom: string
  validUntil: string
  isActive: boolean
  usageLimit?: number
  usedCount: number
  minOrderValue?: number
  maxDiscountAmount?: number
  createdAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    couponName: "",
    couponCode: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    usageLimit: "",
    minOrderValue: "",
    maxDiscountAmount: "",
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/coupons")
      const data = await response.json()
      if (data.success) {
        setCoupons(data.coupons)
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
      }

      const url = editingCoupon ? "/api/admin/coupons" : "/api/admin/coupons"
      const method = editingCoupon ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCoupon ? { ...payload, id: editingCoupon._id } : payload),
      })

      const data = await response.json()

      if (data.success) {
        alert(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!")
        setIsDialogOpen(false)
        resetForm()
        fetchCoupons()
      } else {
        alert(data.error || "Failed to save coupon")
      }
    } catch (error) {
      console.error("Error saving coupon:", error)
      alert("Failed to save coupon")
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      couponName: coupon.couponName,
      couponCode: coupon.couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      validFrom: new Date(coupon.validFrom).toISOString().split("T")[0],
      validUntil: new Date(coupon.validUntil).toISOString().split("T")[0],
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit?.toString() || "",
      minOrderValue: coupon.minOrderValue?.toString() || "",
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        alert("Coupon deleted successfully!")
        fetchCoupons()
      } else {
        alert(data.error || "Failed to delete coupon")
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
      alert("Failed to delete coupon")
    }
  }

  const resetForm = () => {
    setFormData({
      couponName: "",
      couponCode: "",
      discountType: "percentage",
      discountValue: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
      usageLimit: "",
      minOrderValue: "",
      maxDiscountAmount: "",
    })
    setEditingCoupon(null)
  }

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.couponName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.couponCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons for customers</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Coupons</CardTitle>
          <CardDescription>Find coupons by name or code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by coupon name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-gray-600">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No coupons found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <Card key={coupon._id} className={!coupon.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{coupon.couponName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-mono">
                        {coupon.couponCode}
                      </code>
                      {!coupon.isActive && (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon._id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid From:</span>
                    <span>{new Date(coupon.validFrom).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span>{new Date(coupon.validUntil).toLocaleDateString()}</span>
                  </div>
                  {coupon.usageLimit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage:</span>
                      <span>
                        {coupon.usedCount} / {coupon.usageLimit}
                      </span>
                    </div>
                  )}
                  {coupon.minOrderValue && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Order:</span>
                      <span>₹{coupon.minOrderValue}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? "Update the coupon details below" : "Fill in the details to create a new coupon"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="couponName">Coupon Name *</Label>
                  <Input
                    id="couponName"
                    value={formData.couponName}
                    onChange={(e) => setFormData({ ...formData, couponName: e.target.value })}
                    placeholder="e.g., Summer Sale"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon Code *</Label>
                  <Input
                    id="couponCode"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., SUMMER2024"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "percentage" ? "e.g., 10" : "e.g., 500"}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Min Order Value (₹) (Optional)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              {formData.discountType === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹) (Optional)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
