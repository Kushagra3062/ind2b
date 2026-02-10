"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Loader2,
  Send,
  Eye,
  Handshake,
  Clock,
  XCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface QuotationRequest {
  _id: string
  productId: string
  productTitle: string
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

export default function QuotationRequests() {
  const [requests, setRequests] = useState<QuotationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null)
  const [quotePrice, setQuotePrice] = useState("")
  const [quoteMessage, setQuoteMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuotationRequests()
  }, [])

  const fetchQuotationRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/seller/quotations")

      if (!response.ok) {
        throw new Error("Failed to fetch quotation requests")
      }

      const result = await response.json()
      setRequests(result.data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching quotation requests:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "responded":
        return <MessageSquare className="w-4 h-4" />
      case "accepted":
        return <Handshake className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSendQuote = async () => {
    if (!selectedRequest || !quotePrice) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/seller/quotations/${selectedRequest._id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotedPrice: Number(quotePrice),
          response: quoteMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send quote")
      }

      await fetchQuotationRequests()
      setSelectedRequest(null)
      setQuotePrice("")
      setQuoteMessage("")
    } catch (err) {
      console.error("Error sending quote:", err)
      alert("Failed to send quote. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleContactCustomer = (request: QuotationRequest) => {
    const subject = `Regarding your quotation request for ${request.productTitle}`
    const body = `Dear ${request.customerName},\n\nThank you for your interest in our product "${request.productTitle}".\n\nBest regards`
    const mailtoLink = `mailto:${request.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, "_blank")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading quotation requests...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={fetchQuotationRequests} className="mt-4 bg-transparent" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const respondedCount = requests.filter((r) => r.status === "responded").length
  const acceptedCount = requests.filter((r) => r.status === "accepted").length
  const rejectedCount = requests.filter((r) => r.status === "rejected").length

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
            Quotation Requests
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs md:text-sm">
              {requests.length} Total
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs md:text-sm">
              {acceptedCount} Deals Done
            </Badge>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-2xl font-bold text-yellow-700">{pendingCount}</div>
              <div className="text-xs md:text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-700">{respondedCount}</div>
              <div className="text-xs md:text-sm text-blue-600">Responded</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-2xl font-bold text-green-700">{acceptedCount}</div>
              <div className="text-xs md:text-sm text-green-600">Accepted</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 md:p-3 text-center">
              <div className="text-lg md:text-2xl font-bold text-red-700">{rejectedCount}</div>
              <div className="text-xs md:text-sm text-red-600">Rejected</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-0 md:px-6">
        {requests.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-500 px-4">
            <MessageSquare className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-base md:text-lg font-medium">No quotation requests yet</p>
            <p className="text-xs md:text-sm">Customers will be able to request quotes for your products</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="block lg:hidden space-y-4 px-4">
              {requests.map((request) => (
                <Card key={request._id} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{request.productTitle}</h3>
                        <p className="text-xs text-gray-600 mt-1">{request.customerName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{request.customerEmail}</span>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 text-xs ml-2`}>
                        {getStatusIcon(request.status)}
                        {request.status === "accepted"
                          ? "Deal Done"
                          : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 text-xs">Requested:</span>
                        <div className="flex items-center gap-1 font-semibold text-blue-600">
                          <IndianRupee className="w-3 h-3" />
                          {formatCurrency(request.requestedPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Your Quote:</span>
                        {request.sellerQuotedPrice ? (
                          <div className="flex items-center gap-1 font-semibold text-green-600">
                            <IndianRupee className="w-3 h-3" />
                            {formatCurrency(request.sellerQuotedPrice)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs h-8 bg-transparent">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-orange-600" />
                                Quotation Request Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900">Product & Request</h4>
                                  <div className="space-y-2">
                                    <p className="font-medium">{request.productTitle}</p>
                                    <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                                      <IndianRupee className="w-5 h-5" />
                                      {formatCurrency(request.requestedPrice)}
                                    </div>
                                    {request.message && (
                                      <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Customer Message:</p>
                                        <p className="text-sm text-gray-600">{request.message}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900">Customer Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <p className="font-medium">{request.customerName}</p>
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-gray-500" />
                                      {request.customerEmail}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-gray-500" />
                                      {request.customerPhone}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-gray-500" />
                                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {request.status === "accepted" && (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Handshake className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm text-green-800 font-medium">
                                        🎉 Deal Done! Customer accepted your quote of{" "}
                                        {formatCurrency(request.sellerQuotedPrice || 0)}
                                      </p>
                                      <p className="text-xs text-green-700 mt-1">
                                        Contact the customer to proceed with the order.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {request.status === "rejected" && (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <div>
                                      <p className="text-sm text-red-800 font-medium">Customer rejected your quote</p>
                                      {request.rejectionReason && (
                                        <p className="text-sm text-red-700 mt-1">
                                          <span className="font-medium">Reason:</span> {request.rejectionReason}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleContactCustomer(request)}>
                                  <Mail className="h-4 w-4 mr-1" />
                                  Contact Customer
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {request.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-xs h-8"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Quote
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] md:max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Send Quote Response</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">Product: {request.productTitle}</p>
                                  <p className="text-sm text-gray-600">Customer: {request.customerName}</p>
                                  <p className="text-sm text-gray-600">
                                    Requested Price: {formatCurrency(request.requestedPrice)}
                                  </p>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Your Quoted Price </label>
                                  <Input
                                    type="number"
                                    placeholder="Enter your quoted price"
                                    value={quotePrice}
                                    onChange={(e) => setQuotePrice(e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Message (Optional)</label>
                                  <Textarea
                                    placeholder="Add any additional details or terms..."
                                    value={quoteMessage}
                                    onChange={(e) => setQuoteMessage(e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSendQuote}
                                    disabled={!quotePrice || submitting}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    {submitting ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 mr-1" />
                                        Send Quote
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Product & Customer</TableHead>
                    <TableHead className="font-semibold">Requested Price</TableHead>
                    <TableHead className="font-semibold">Your Quote</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{request.productTitle}</div>
                          <div className="text-sm text-gray-600">{request.customerName}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            {request.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-blue-600">
                          <IndianRupee className="w-4 h-4" />
                          {formatCurrency(request.requestedPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.sellerQuotedPrice ? (
                          <div className="flex items-center gap-1 font-semibold text-green-600">
                            <IndianRupee className="w-4 h-4" />
                            {formatCurrency(request.sellerQuotedPrice)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(request.status)}
                          {request.status === "accepted"
                            ? "Deal Done"
                            : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MessageSquare className="w-5 h-5 text-orange-600" />
                                  Quotation Request Details
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">Product & Request</h4>
                                    <div className="space-y-2">
                                      <p className="font-medium">{request.productTitle}</p>
                                      <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                                        <IndianRupee className="w-5 h-5" />
                                        {formatCurrency(request.requestedPrice)}
                                      </div>
                                      {request.message && (
                                        <div className="bg-gray-50 p-3 rounded">
                                          <p className="text-sm font-medium text-gray-700 mb-1">Customer Message:</p>
                                          <p className="text-sm text-gray-600">{request.message}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">Customer Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <p className="font-medium">{request.customerName}</p>
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        {request.customerEmail}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        {request.customerPhone}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {request.status === "accepted" && (
                                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Handshake className="w-5 h-5 text-green-600" />
                                      <div>
                                        <p className="text-sm text-green-800 font-medium">
                                          🎉 Deal Done! Customer accepted your quote of{" "}
                                          {formatCurrency(request.sellerQuotedPrice || 0)}
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                          Contact the customer to proceed with the order.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {request.status === "rejected" && (
                                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="w-5 h-5 text-red-600" />
                                      <div>
                                        <p className="text-sm text-red-800 font-medium">Customer rejected your quote</p>
                                        {request.rejectionReason && (
                                          <p className="text-sm text-red-700 mt-1">
                                            <span className="font-medium">Reason:</span> {request.rejectionReason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleContactCustomer(request)}>
                                    <Mail className="h-4 w-4 mr-1" />
                                    Contact Customer
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {request.status === "pending" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Send Quote
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send Quote Response</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm font-medium mb-2">Product: {request.productTitle}</p>
                                    <p className="text-sm text-gray-600">Customer: {request.customerName}</p>
                                    <p className="text-sm text-gray-600">
                                      Requested Price: {formatCurrency(request.requestedPrice)}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Your Quoted Price</label>
                                    <Input
                                      type="number"
                                      placeholder="Enter your quoted price"
                                      value={quotePrice}
                                      onChange={(e) => setQuotePrice(e.target.value)}
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">Message (Optional)</label>
                                    <Textarea
                                      placeholder="Add any additional details or terms..."
                                      value={quoteMessage}
                                      onChange={(e) => setQuoteMessage(e.target.value)}
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleSendQuote}
                                      disabled={!quotePrice || submitting}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      {submitting ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          Sending...
                                        </>
                                      ) : (
                                        <>
                                          <Send className="h-4 w-4 mr-1" />
                                          Send Quote
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
