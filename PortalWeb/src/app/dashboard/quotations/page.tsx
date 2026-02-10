"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Package,
  Calendar,
  Phone,
  Mail,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Handshake,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/quotations")
      const data = await response.json()

      if (data.success) {
        setQuotations(data.quotations)
      } else {
        setError(data.error || "Failed to fetch quotations")
      }
    } catch (err) {
      setError("Failed to fetch quotations")
      console.error("Error fetching quotations:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptQuote = async (quotationId: string) => {
    try {
      setActionLoading(quotationId)
      const response = await fetch(`/api/quotations/${quotationId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        await fetchQuotations()
        alert("Quote accepted successfully! Deal is done.")
      } else {
        alert(data.error || "Failed to accept quote")
      }
    } catch (error) {
      console.error("Error accepting quote:", error)
      alert("Failed to accept quote. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectQuote = async (quotationId: string) => {
    try {
      setActionLoading(quotationId)
      const response = await fetch(`/api/quotations/${quotationId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchQuotations()
        setRejectionReason("")
        alert("Quote rejected successfully")
      } else {
        alert(data.error || "Failed to reject quote")
      }
    } catch (error) {
      console.error("Error rejecting quote:", error)
      alert("Failed to reject quote. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "responded":
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case "accepted":
        return <Handshake className="w-4 h-4 text-green-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "responded":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Quotations</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchQuotations}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Quotations</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Track and manage your price quotation requests</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Badge variant="outline" className="text-xs md:text-sm px-2 md:px-3 py-1 w-fit">
            {quotations.length} Total Requests
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs md:text-sm w-fit">
            {quotations.filter((q) => q.status === "accepted").length} Deals Done
          </Badge>
        </div>
      </div>

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8 md:py-12">
            <div className="text-center px-4">
              <MessageSquare className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Quotations Yet</h3>
              <p className="text-gray-600 text-sm md:text-base">
                You haven't requested any quotations yet. Browse products and request quotes from sellers.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              Quotation Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 md:px-6">
            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-4 px-4">
              {quotations.map((quotation) => (
                <Card key={quotation._id} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">{quotation.productTitle}</h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {quotation._id.slice(-8)}</p>
                      </div>
                      <Badge className={`${getStatusColor(quotation.status)} flex items-center gap-1 text-xs ml-2`}>
                        {getStatusIcon(quotation.status)}
                        {quotation.status === "accepted"
                          ? "Deal Done"
                          : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 text-xs">Requested:</span>
                        <div className="flex items-center gap-1 font-semibold text-blue-600">
                          ₹{quotation.requestedPrice.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Seller Quote:</span>
                        {quotation.sellerQuotedPrice ? (
                          <div className="flex items-center gap-1 font-semibold text-green-600">
                            ₹{quotation.sellerQuotedPrice.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(quotation.createdAt), { addSuffix: true })}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 bg-transparent"
                              onClick={() => setSelectedQuotation(quotation)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                {selectedQuotation?.productTitle}
                              </DialogTitle>
                              <DialogDescription>Quotation details and seller response</DialogDescription>
                            </DialogHeader>

                            {selectedQuotation && (
                              <div className="space-y-6">
                                {/* Request Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">Your Request</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Requested Price:</span>
                                        <span className="font-semibold text-blue-600">
                                          ₹{selectedQuotation.requestedPrice.toLocaleString()}
                                        </span>
                                      </div>
                                      {selectedQuotation.message && (
                                        <div className="text-sm">
                                          <span className="font-medium text-gray-700">Message:</span>
                                          <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                            {selectedQuotation.message}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">Contact Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>{selectedQuotation.customerEmail}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>{selectedQuotation.customerPhone}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>
                                          {formatDistanceToNow(new Date(selectedQuotation.createdAt), {
                                            addSuffix: true,
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Seller Response */}
                                {selectedQuotation.status === "responded" && (
                                  <>
                                    <Separator />
                                    <div className="space-y-4">
                                      <h4 className="font-semibold text-green-600 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Seller Response
                                      </h4>

                                      {selectedQuotation.sellerQuotedPrice && (
                                        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                                          ₹{selectedQuotation.sellerQuotedPrice.toLocaleString()}
                                        </div>
                                      )}

                                      {selectedQuotation.sellerResponse && (
                                        <div className="bg-green-50 p-4 rounded-lg">
                                          <p className="text-sm text-gray-700">{selectedQuotation.sellerResponse}</p>
                                        </div>
                                      )}

                                      <div className="flex gap-3 pt-2">
                                        <Button
                                          onClick={() => handleAcceptQuote(selectedQuotation._id)}
                                          disabled={actionLoading === selectedQuotation._id}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <ThumbsUp className="w-4 h-4 mr-2" />
                                          {actionLoading === selectedQuotation._id ? "Accepting..." : "Accept Quote"}
                                        </Button>

                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="outline"
                                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                            >
                                              <ThumbsDown className="w-4 h-4 mr-2" />
                                              Reject Quote
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Reject Quote</DialogTitle>
                                              <DialogDescription>
                                                Please provide a reason for rejecting this quote (optional)
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <Textarea
                                                placeholder="Reason for rejection (optional)..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                rows={3}
                                              />
                                              <div className="flex gap-2 justify-end">
                                                <Button variant="outline">Cancel</Button>
                                                <Button
                                                  onClick={() => handleRejectQuote(selectedQuotation._id)}
                                                  disabled={actionLoading === selectedQuotation._id}
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  {actionLoading === selectedQuotation._id
                                                    ? "Rejecting..."
                                                    : "Reject Quote"}
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Status Messages */}
                                {selectedQuotation.status === "pending" && (
                                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-5 h-5 text-yellow-600" />
                                      <p className="text-sm text-yellow-800 font-medium">
                                        Your quotation request is pending. The seller will respond soon.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedQuotation.status === "accepted" && (
                                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Handshake className="w-5 h-5 text-green-600" />
                                      <p className="text-sm text-green-800 font-medium">
                                        🎉 Deal Done! You have accepted this quotation. The seller will contact you for
                                        next steps.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedQuotation.status === "rejected" && (
                                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="w-5 h-5 text-red-600" />
                                      <div>
                                        <p className="text-sm text-red-800 font-medium">
                                          This quotation was rejected. You can request a new quote if needed.
                                        </p>
                                        {selectedQuotation.rejectionReason && (
                                          <p className="text-sm text-red-700 mt-1">
                                            <span className="font-medium">Reason:</span>{" "}
                                            {selectedQuotation.rejectionReason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {quotation.status === "responded" && (
                          <Button
                            onClick={() => handleAcceptQuote(quotation._id)}
                            disabled={actionLoading === quotation._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs h-8"
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {actionLoading === quotation._id ? "..." : "Accept"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Requested Price</TableHead>
                    <TableHead className="font-semibold">Seller Quote</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow key={quotation._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium text-gray-900">{quotation.productTitle}</div>
                        <div className="text-sm text-gray-500">ID: {quotation._id.slice(-8)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-blue-600">
                          ₹{quotation.requestedPrice.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {quotation.sellerQuotedPrice ? (
                          <div className="flex items-center gap-1 font-semibold text-green-600">
                            ₹{quotation.sellerQuotedPrice.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(quotation.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(quotation.status)}
                          {quotation.status === "accepted"
                            ? "Deal Done"
                            : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(quotation.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedQuotation(quotation)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Package className="w-5 h-5 text-blue-600" />
                                  {selectedQuotation?.productTitle}
                                </DialogTitle>
                                <DialogDescription>Quotation details and seller response</DialogDescription>
                              </DialogHeader>

                              {selectedQuotation && (
                                <div className="space-y-6">
                                  {/* Request Details */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900">Your Request</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">Requested Price:</span>
                                          <span className="font-semibold text-blue-600">
                                            ₹{selectedQuotation.requestedPrice.toLocaleString()}
                                          </span>
                                        </div>
                                        {selectedQuotation.message && (
                                          <div className="text-sm">
                                            <span className="font-medium text-gray-700">Message:</span>
                                            <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                              {selectedQuotation.message}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900">Contact Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-4 h-4 text-gray-500" />
                                          <span>{selectedQuotation.customerEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-gray-500" />
                                          <span>{selectedQuotation.customerPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-gray-500" />
                                          <span>
                                            {formatDistanceToNow(new Date(selectedQuotation.createdAt), {
                                              addSuffix: true,
                                            })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Seller Response */}
                                  {selectedQuotation.status === "responded" && (
                                    <>
                                      <Separator />
                                      <div className="space-y-4">
                                        <h4 className="font-semibold text-green-600 flex items-center gap-2">
                                          <MessageSquare className="w-4 h-4" />
                                          Seller Response
                                        </h4>

                                        {selectedQuotation.sellerQuotedPrice && (
                                          <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                                            ₹{selectedQuotation.sellerQuotedPrice.toLocaleString()}
                                          </div>
                                        )}

                                        {selectedQuotation.sellerResponse && (
                                          <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-700">{selectedQuotation.sellerResponse}</p>
                                          </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                          <Button
                                            onClick={() => handleAcceptQuote(selectedQuotation._id)}
                                            disabled={actionLoading === selectedQuotation._id}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <ThumbsUp className="w-4 h-4 mr-2" />
                                            {actionLoading === selectedQuotation._id ? "Accepting..." : "Accept Quote"}
                                          </Button>

                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                              >
                                                <ThumbsDown className="w-4 h-4 mr-2" />
                                                Reject Quote
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Reject Quote</DialogTitle>
                                                <DialogDescription>
                                                  Please provide a reason for rejecting this quote (optional)
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <Textarea
                                                  placeholder="Reason for rejection (optional)..."
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  rows={3}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                  <Button variant="outline">Cancel</Button>
                                                  <Button
                                                    onClick={() => handleRejectQuote(selectedQuotation._id)}
                                                    disabled={actionLoading === selectedQuotation._id}
                                                    className="bg-red-600 hover:bg-red-700"
                                                  >
                                                    {actionLoading === selectedQuotation._id
                                                      ? "Rejecting..."
                                                      : "Reject Quote"}
                                                  </Button>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Status Messages */}
                                  {selectedQuotation.status === "pending" && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                        <p className="text-sm text-yellow-800 font-medium">
                                          Your quotation request is pending. The seller will respond soon.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedQuotation.status === "accepted" && (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Handshake className="w-5 h-5 text-green-600" />
                                        <p className="text-sm text-green-800 font-medium">
                                          🎉 Deal Done! You have accepted this quotation. The seller will contact you
                                          for next steps.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedQuotation.status === "rejected" && (
                                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <div>
                                          <p className="text-sm text-red-800 font-medium">
                                            This quotation was rejected. You can request a new quote if needed.
                                          </p>
                                          {selectedQuotation.rejectionReason && (
                                            <p className="text-sm text-red-700 mt-1">
                                              <span className="font-medium">Reason:</span>{" "}
                                              {selectedQuotation.rejectionReason}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {quotation.status === "responded" && (
                            <Button
                              onClick={() => handleAcceptQuote(quotation._id)}
                              disabled={actionLoading === quotation._id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {actionLoading === quotation._id ? "Accepting..." : "Accept"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
