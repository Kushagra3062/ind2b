"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface QuotationRequest {
  _id: string
  productId: string
  productTitle: string
  sellerId: string
  userId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  requestedPrice: number
  message?: string
  status: "pending" | "responded" | "accepted" | "rejected"
  sellerResponse?: string
  sellerQuotedPrice?: number
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

interface Statistics {
  total: number
  pending: number
  responded: number
  accepted: number
  rejected: number
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    pending: 0,
    responded: 0,
    accepted: 0,
    rejected: 0,
  })
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  const itemsPerPage = 10

  const fetchQuotations = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      const response = await fetch(`/api/admin/quotations?${params}`)
      const result = await response.json()

      if (result.success) {
        setQuotations(result.data)
        setTotalPages(result.pagination.totalPages)
        setStatistics(result.statistics)

        if (showRefreshToast) {
          toast.success("Quotations data refreshed successfully!")
        }
      } else {
        console.error("Failed to fetch quotations:", result.error)
        toast.error("Failed to fetch quotations")
      }
    } catch (error) {
      console.error("Error fetching quotations:", error)
      toast.error("Error fetching quotations")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [currentPage, statusFilter, searchTerm])

  const handleRefresh = () => {
    fetchQuotations(true)
  }

  const handleStatusUpdate = async (quotationId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/quotations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotationId,
          status: newStatus,
          adminNotes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setQuotations((prev) =>
          prev.map((q) =>
            q._id === quotationId ? { ...q, status: newStatus as any, updatedAt: new Date().toISOString() } : q,
          ),
        )
        toast.success("Quotation status updated successfully!")
        setSelectedQuotation(null)
        setAdminNotes("")
        fetchQuotations() // Refresh to update statistics
      } else {
        toast.error("Failed to update quotation status")
      }
    } catch (error) {
      console.error("Error updating quotation status:", error)
      toast.error("Error updating quotation status")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Pending" },
      responded: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "Responded" },
      accepted: { color: "bg-green-100 text-green-800 border-green-300", label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-800 border-red-300", label: "Rejected" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={cn("border", config.color)}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Product Quotations</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Product Quotations</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Manage all quotation requests and seller interactions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-fit bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-yellow-600">{statistics.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-blue-600">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{statistics.responded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-green-600">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{statistics.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-red-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{statistics.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by product, customer name, email, or phone..."
            className="pl-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotations Display */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Card Layout */}
        <div className="block lg:hidden">
          {quotations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {quotations.map((quotation) => (
                <div key={quotation._id} className="p-4 hover:bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{quotation.productTitle}</h3>
                        <p className="text-xs text-gray-600 mt-1">{quotation.customerName}</p>
                        <p className="text-xs text-gray-500 truncate">{quotation.customerEmail}</p>
                      </div>
                      {getStatusBadge(quotation.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 text-xs">Requested:</span>
                        <div className="font-medium">{formatCurrency(quotation.requestedPrice)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Quoted:</span>
                        <div className="font-medium text-blue-600">
                          {quotation.sellerQuotedPrice ? formatCurrency(quotation.sellerQuotedPrice) : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-gray-500">{formatDate(quotation.createdAt)}</div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 bg-transparent"
                            onClick={() => setSelectedQuotation(quotation)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                          {selectedQuotation && (
                            <div className="space-y-6 py-4">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                  <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-gray-900 truncate">
                                      {selectedQuotation.productTitle}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                      {getStatusBadge(selectedQuotation.status)}
                                      <span className="text-sm text-gray-500">
                                        ID: {selectedQuotation._id.slice(-8)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Created</div>
                                    <div className="font-semibold text-gray-900">
                                      {formatDate(selectedQuotation.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                  {/* Product Information */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Product Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-gray-600">Product Title:</span>
                                        <span className="text-sm text-gray-900 text-right max-w-xs">
                                          {selectedQuotation.productTitle}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Product ID:</span>
                                        <span className="text-sm font-mono text-gray-700">
                                          {selectedQuotation.productId}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Seller ID:</span>
                                        <span className="text-sm font-mono text-gray-700">
                                          {selectedQuotation.sellerId}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Customer Information */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Customer Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Name:</span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {selectedQuotation.customerName}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Email:</span>
                                        <span className="text-sm text-blue-600 hover:text-blue-800">
                                          {selectedQuotation.customerEmail}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                                        <span className="text-sm text-gray-900 font-mono">
                                          {selectedQuotation.customerPhone}
                                        </span>
                                      </div>
                                      {selectedQuotation.userId && (
                                        <div className="flex justify-between">
                                          <span className="text-sm font-medium text-gray-600">User ID:</span>
                                          <span className="text-sm font-mono text-gray-700">
                                            {selectedQuotation.userId}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                  {/* Pricing Information */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Pricing Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="text-sm font-medium text-blue-800 mb-1">Customer Requested</div>
                                        <div className="text-2xl font-bold text-blue-900">
                                          {formatCurrency(selectedQuotation.requestedPrice)}
                                        </div>
                                      </div>
                                      {selectedQuotation.sellerQuotedPrice && (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                          <div className="text-sm font-medium text-green-800 mb-1">Seller Quoted</div>
                                          <div className="text-2xl font-bold text-green-900">
                                            {formatCurrency(selectedQuotation.sellerQuotedPrice)}
                                          </div>
                                          {selectedQuotation.sellerQuotedPrice !== selectedQuotation.requestedPrice && (
                                            <div className="text-sm text-green-700 mt-1">
                                              {selectedQuotation.sellerQuotedPrice > selectedQuotation.requestedPrice
                                                ? `+${formatCurrency(selectedQuotation.sellerQuotedPrice - selectedQuotation.requestedPrice)} higher`
                                                : `${formatCurrency(selectedQuotation.requestedPrice - selectedQuotation.sellerQuotedPrice)} lower`}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Timeline */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Timeline</h3>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">Request Created</div>
                                          <div className="text-xs text-gray-600">
                                            {formatDate(selectedQuotation.createdAt)}
                                          </div>
                                        </div>
                                      </div>
                                      {selectedQuotation.updatedAt !== selectedQuotation.createdAt && (
                                        <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">Last Updated</div>
                                            <div className="text-xs text-gray-600">
                                              {formatDate(selectedQuotation.updatedAt)}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {(selectedQuotation.message ||
                                selectedQuotation.sellerResponse ||
                                selectedQuotation.rejectionReason) && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                  <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <h3 className="font-semibold text-lg text-gray-900">Conversation History</h3>
                                  </div>
                                  <div className="space-y-4">
                                    {selectedQuotation.message && (
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-blue-700">C</span>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-blue-800">Customer Message</span>
                                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                Initial Request
                                              </span>
                                            </div>
                                            <p className="text-blue-700 text-sm leading-relaxed">
                                              {selectedQuotation.message}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {selectedQuotation.sellerResponse && (
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-green-700">S</span>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-green-800">Seller Response</span>
                                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                                Quote Provided
                                              </span>
                                            </div>
                                            <p className="text-green-700 text-sm leading-relaxed">
                                              {selectedQuotation.sellerResponse}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {selectedQuotation.rejectionReason && (
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-red-700">S</span>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-red-800">Rejection Reason</span>
                                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                                Request Declined
                                              </span>
                                            </div>
                                            <p className="text-red-700 text-sm leading-relaxed">
                                              {selectedQuotation.rejectionReason}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                  <h3 className="font-semibold text-lg text-gray-900">Admin Management</h3>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Admin Notes (Optional)
                                    </label>
                                    <Textarea
                                      placeholder="Add internal notes about this quotation request..."
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      rows={3}
                                      className="resize-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                      Update Status
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                      <Button
                                        variant={selectedQuotation.status === "pending" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "pending")}
                                        disabled={selectedQuotation.status === "pending"}
                                        className="w-full"
                                      >
                                        Pending
                                      </Button>
                                      <Button
                                        variant={selectedQuotation.status === "responded" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "responded")}
                                        disabled={selectedQuotation.status === "responded"}
                                        className="w-full"
                                      >
                                        Responded
                                      </Button>
                                      <Button
                                        variant={selectedQuotation.status === "accepted" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "accepted")}
                                        disabled={selectedQuotation.status === "accepted"}
                                        className="w-full"
                                      >
                                        Accepted
                                      </Button>
                                      <Button
                                        variant={selectedQuotation.status === "rejected" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "rejected")}
                                        disabled={selectedQuotation.status === "rejected"}
                                        className="w-full"
                                      >
                                        Rejected
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No quotations found matching your filters."
                : "No quotation requests found."}
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product & Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotations.length > 0 ? (
                quotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 truncate max-w-xs">{quotation.productTitle}</div>
                        <div className="text-sm text-gray-600">{quotation.customerName}</div>
                        <div className="text-sm text-gray-500">{quotation.customerEmail}</div>
                        <div className="text-sm text-gray-500">{quotation.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Requested: </span>
                          <span className="font-medium">{formatCurrency(quotation.requestedPrice)}</span>
                        </div>
                        {quotation.sellerQuotedPrice && (
                          <div className="text-sm">
                            <span className="text-gray-600">Quoted: </span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(quotation.sellerQuotedPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(quotation.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{formatDate(quotation.createdAt)}</div>
                      {quotation.updatedAt !== quotation.createdAt && (
                        <div className="text-xs text-gray-400">Updated: {formatDate(quotation.updatedAt)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedQuotation(quotation)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader className="border-b pb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                              Quotation Request Details
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Complete information and interaction history for this quotation request
                            </DialogDescription>
                          </DialogHeader>
                          {selectedQuotation && (
                            <div className="space-y-6 py-4">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                  <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-gray-900 truncate">
                                      {selectedQuotation.productTitle}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                      {getStatusBadge(selectedQuotation.status)}
                                      <span className="text-sm text-gray-500">
                                        ID: {selectedQuotation._id.slice(-8)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Created</div>
                                    <div className="font-semibold text-gray-900">
                                      {formatDate(selectedQuotation.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                  {/* Product Information */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Product Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-gray-600">Product Title:</span>
                                        <span className="text-sm text-gray-900 text-right max-w-xs">
                                          {selectedQuotation.productTitle}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Product ID:</span>
                                        <span className="text-sm font-mono text-gray-700">
                                          {selectedQuotation.productId}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Seller ID:</span>
                                        <span className="text-sm font-mono text-gray-700">
                                          {selectedQuotation.sellerId}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Customer Information */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Customer Information</h3>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Name:</span>
                                        <span className="text-sm text-gray-900 font-medium">
                                          {selectedQuotation.customerName}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Email:</span>
                                        <span className="text-sm text-blue-600 hover:text-blue-800">
                                          {selectedQuotation.customerEmail}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                                        <span className="text-sm text-gray-900 font-mono">
                                          {selectedQuotation.customerPhone}
                                        </span>
                                      </div>
                                      {selectedQuotation.userId && (
                                        <div className="flex justify-between">
                                          <span className="text-sm font-medium text-gray-600">User ID:</span>
                                          <span className="text-sm font-mono text-gray-700">
                                            {selectedQuotation.userId}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                  {/* Pricing Information */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Pricing Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="text-sm font-medium text-blue-800 mb-1">Customer Requested</div>
                                        <div className="text-2xl font-bold text-blue-900">
                                          {formatCurrency(selectedQuotation.requestedPrice)}
                                        </div>
                                      </div>
                                      {selectedQuotation.sellerQuotedPrice && (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                          <div className="text-sm font-medium text-green-800 mb-1">Seller Quoted</div>
                                          <div className="text-2xl font-bold text-green-900">
                                            {formatCurrency(selectedQuotation.sellerQuotedPrice)}
                                          </div>
                                          {selectedQuotation.sellerQuotedPrice !== selectedQuotation.requestedPrice && (
                                            <div className="text-sm text-green-700 mt-1">
                                              {selectedQuotation.sellerQuotedPrice > selectedQuotation.requestedPrice
                                                ? `+${formatCurrency(selectedQuotation.sellerQuotedPrice - selectedQuotation.requestedPrice)} higher`
                                                : `${formatCurrency(selectedQuotation.requestedPrice - selectedQuotation.sellerQuotedPrice)} lower`}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Timeline */}
                                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                      <h3 className="font-semibold text-lg text-gray-900">Timeline</h3>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">Request Created</div>
                                          <div className="text-xs text-gray-600">
                                            {formatDate(selectedQuotation.createdAt)}
                                          </div>
                                        </div>
                                      </div>
                                      {selectedQuotation.updatedAt !== selectedQuotation.createdAt && (
                                        <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">Last Updated</div>
                                            <div className="text-xs text-gray-600">
                                              {formatDate(selectedQuotation.updatedAt)}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {(selectedQuotation.message ||
                                selectedQuotation.sellerResponse ||
                                selectedQuotation.rejectionReason) && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                  <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <h3 className="font-semibold text-lg text-gray-900">Conversation History</h3>
                                  </div>
                                  <div className="space-y-4">
                                    {selectedQuotation.message && (
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-blue-700">C</span>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-blue-800">Customer Message</span>
                                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                Initial Request
                                              </span>
                                            </div>
                                            <p className="text-blue-700 text-sm leading-relaxed">
                                              {selectedQuotation.message}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {selectedQuotation.sellerResponse && (
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-green-700">S</span>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-green-800">Seller Response</span>
                                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                                Quote Provided
                                              </span>
                                            </div>
                                            <p className="text-green-700 text-sm leading-relaxed">
                                              {selectedQuotation.sellerResponse}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {selectedQuotation.rejectionReason && (
                                      <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-semibold text-red-700">S</span>
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-red-800">Rejection Reason</span>
                                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                                Request Declined
                                              </span>
                                            </div>
                                            <p className="text-red-700 text-sm leading-relaxed">
                                              {selectedQuotation.rejectionReason}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                  <h3 className="font-semibold text-lg text-gray-900">Admin Management</h3>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Admin Notes (Optional)
                                    </label>
                                    <Textarea
                                      placeholder="Add internal notes about this quotation request..."
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      rows={3}
                                      className="resize-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                      Update Status
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                      <Button
                                        variant={selectedQuotation.status === "pending" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "pending")}
                                        disabled={selectedQuotation.status === "pending"}
                                        className="w-full"
                                      >
                                        Pending
                                      </Button>
                                      <Button
                                        variant={selectedQuotation.status === "responded" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "responded")}
                                        disabled={selectedQuotation.status === "responded"}
                                        className="w-full"
                                      >
                                        Responded
                                      </Button>
                                      <Button
                                        variant={selectedQuotation.status === "accepted" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "accepted")}
                                        disabled={selectedQuotation.status === "accepted"}
                                        className="w-full"
                                      >
                                        Accepted
                                      </Button>
                                      <Button
                                        variant={selectedQuotation.status === "rejected" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusUpdate(selectedQuotation._id, "rejected")}
                                        disabled={selectedQuotation.status === "rejected"}
                                        className="w-full"
                                      >
                                        Rejected
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== "all"
                      ? "No quotations found matching your filters."
                      : "No quotation requests found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
