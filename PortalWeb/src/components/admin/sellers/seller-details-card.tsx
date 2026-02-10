"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Seller {
  id: string
  name: string
  tradeName: string
  email: string
  phone: string
  registeredDate: string
}

interface SellerDetailsCardProps {
  sellerId: string
}

export function SellerDetailsCard({ sellerId }: SellerDetailsCardProps) {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await fetch(`/api/admin/sellers/${sellerId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch seller details")
        }

        const data = await response.json()
        setSeller(data)
      } catch (error) {
        console.error("Error fetching seller details:", error)
        toast({
          title: "Error",
          description: "Failed to fetch seller details. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (sellerId) {
      fetchSellerDetails()
    }
  }, [sellerId, toast])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sellers
        </Button>
        <h1 className="text-2xl font-bold">Seller Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? <Skeleton className="h-8 w-48" /> : seller?.name || "Seller Details"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : seller ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                <p className="mt-1">{seller.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Legal Entity Name</h3>
                <p className="mt-1">{seller.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Trade Name</h3>
                <p className="mt-1">{seller.tradeName || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{seller.email || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{seller.phone || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Registered Date</h3>
                <p className="mt-1">{seller.registeredDate || "N/A"}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Seller not found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
