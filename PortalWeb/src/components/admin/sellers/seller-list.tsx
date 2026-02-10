"use client"

import { Toaster } from "@/components/ui/sonner"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Seller {
  _id: string
  id: string
  name: string
  tradeName: string
  email: string
  phone: string
  registeredDate: string
  status: "Approved" | "Reject" | "Review" | "Pending Completion"
}

export function SellerList() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Seller
    direction: "ascending" | "descending"
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [searchColumn, setSearchColumn] = useState<"id" | "name" | "email">("name")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/sellers")

        if (!response.ok) {
          throw new Error("Failed to fetch sellers")
        }

        const data = await response.json()
        console.log("Fetched sellers:", data)
        setSellers(data)
      } catch (error) {
        console.error("Error fetching sellers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch sellers. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSellers()
  }, [toast])

  const filteredSellers = useMemo(() => {
    let filtered = [...sellers]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((seller) => {
        const searchTermLower = searchTerm.toLowerCase()
        let valueToSearch = ""
        if (searchColumn === "id") {
          valueToSearch = seller.id?.toLowerCase() || ""
        } else if (searchColumn === "name") {
          valueToSearch = seller.name?.toLowerCase() || ""
        } else if (searchColumn === "email") {
          valueToSearch = seller.email?.toLowerCase() || ""
        }
        return valueToSearch.startsWith(searchTermLower)
      })
    }

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || ""
        const bValue = b[sortConfig.key] || ""
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [sellers, searchTerm, sortConfig, searchColumn])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page on search or sort
  }, [searchTerm, sortConfig])

  const handleAddSeller = () => {
    router.push("/admin/sellers/add")
  }

  const handleViewSeller = (sellerId: string) => {
    router.push(`/admin/sellers/${sellerId}`)
  }

  const handleSort = (key: keyof Seller) => {
    setSortConfig((currentSortConfig) => {
      if (currentSortConfig?.key === key) {
        return {
          key,
          direction: currentSortConfig.direction === "ascending" ? "descending" : "ascending",
        }
      } else {
        return { key, direction: "ascending" }
      }
    })
  }

  // Calculate total pages
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage)

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSellers.slice(startIndex, endIndex)
  }

  const currentPageData = getCurrentPageData()

  const handleStatusChange = async (
    sellerId: string,
    status: "Approved" | "Reject" | "Review" | "Pending Completion",
  ) => {
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update seller status")
      }

      // Update the local state
      setSellers((prevSellers) =>
        prevSellers.map((seller) => (seller._id === sellerId ? { ...seller, status } : seller)),
      )

      toast({
        title: "Status updated",
        description: `Seller status updated to ${status}`,
      })
    } catch (err) {
      console.error("Error updating seller status:", err)
      toast({
        title: "Error",
        description: "Failed to update seller status. Please try again.",
      })
    }
  }

  const statusColors = {
    Approved: "bg-green-100 text-green-800 border-green-300",
    Reject: "bg-red-100 text-red-800 border-red-300",
    Review: "bg-amber-100 text-amber-800 border-amber-300",
    "Pending Completion": "bg-blue-100 text-blue-800 border-blue-300",
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Sellers</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search sellers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={searchColumn} onValueChange={(value: any) => setSearchColumn(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="id">GSTIN</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddSeller} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Seller
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("_id")}
                >
                  <div className="flex items-center">
                    Seller ID
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    GSTIN
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Seller Name
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    Email ID
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : currentPageData.length > 0 ? (
                currentPageData.map((seller) => (
                  <tr
                    key={seller._id || Math.random().toString()}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewSeller(seller.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {seller._id || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {seller.id || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.email || "N/A"}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        defaultValue="Review"
                        value={seller.status || "Review"}
                        onValueChange={(value) =>
                          handleStatusChange(
                            seller._id,
                            value as "Approved" | "Reject" | "Review" | "Pending Completion",
                          )
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[180px] h-8 border-2",
                            seller.status === "Approved"
                              ? statusColors.Approved
                              : seller.status === "Reject"
                                ? statusColors.Reject
                                : seller.status === "Pending Completion"
                                  ? statusColors["Pending Completion"]
                                  : statusColors.Review,
                          )}
                        >
                          <SelectValue placeholder="Review" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="bg-green-100 text-green-800 hover:bg-green-200" value="Approved">
                            Approved
                          </SelectItem>
                          <SelectItem className="bg-red-100 text-red-800 hover:bg-red-200" value="Reject">
                            Reject
                          </SelectItem>
                          <SelectItem className="bg-amber-100 text-amber-800 hover:bg-amber-200" value="Review">
                            Review
                          </SelectItem>
                          <SelectItem
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                            value="Pending Completion"
                          >
                            Pending Completion
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? "No sellers found matching your search." : "No sellers found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => {
            setCurrentPage((prev) => Math.max(prev - 1, 1))
            window.scrollTo({ top: 0, behavior: "smooth" }) // Added smooth scroll to top when clicking Previous
          }}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          onClick={() => {
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            window.scrollTo({ top: 0, behavior: "smooth" }) // Added smooth scroll to top when clicking Next
          }}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <Toaster />
    </div>
  )
}
