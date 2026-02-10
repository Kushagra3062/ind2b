"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from "sonner"

interface CustomerQuery {
  _id: string
  name: string
  email: string
  phone: string
  queryType: string
  message: string
  orderId: string | null
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

interface Statistics {
  total: number
  new: number
  inProgress: number
  resolved: number
  closed: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalMessages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function CustomerQueryPage() {
  const [queries, setQueries] = useState<CustomerQuery[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [queryTypeFilter, setQueryTypeFilter] = useState("all")
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null)

  const fetchQueries = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (search) params.append("search", search)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (queryTypeFilter !== "all") params.append("queryType", queryTypeFilter)

      const response = await fetch(`/api/admin/customer-query?${params}`)
      const data = await response.json()

      if (data.success) {
        setQueries(data.data.messages)
        setStatistics(data.data.statistics)
        setPagination(data.data.pagination)
      } else {
        toast.error("Failed to fetch customer queries")
      }
    } catch (error) {
      console.error("Error fetching queries:", error)
      toast.error("Error fetching customer queries")
    } finally {
      setLoading(false)
    }
  }

  const updateQueryStatus = async (messageId: string, status: string, priority?: string) => {
    try {
      const response = await fetch("/api/admin/customer-query/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId, status, priority }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Query updated successfully")
        fetchQueries(pagination.currentPage)
      } else {
        toast.error(data.error || "Failed to update query")
      }
    } catch (error) {
      console.error("Error updating query:", error)
      toast.error("Error updating query")
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [search, statusFilter, queryTypeFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
      "in-progress": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      closed: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}>
        <span className="hidden sm:inline">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
        <span className="sm:hidden">{priority.charAt(0).toUpperCase()}</span>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Queries</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and respond to customer inquiries</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{statistics.new}</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{statistics.inProgress}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{statistics.resolved}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-3 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Closed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-600">{statistics.closed}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={queryTypeFilter} onValueChange={setQueryTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Customer Queries ({pagination.totalMessages})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3 p-3">
                {queries.map((query) => (
                  <Card key={query._id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{query.name}</p>
                          <p className="text-xs text-gray-500">{query.email}</p>
                        </div>
                        <div className="flex gap-1">
                          {getStatusBadge(query.status)}
                          {getPriorityBadge(query.priority)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <Badge variant="outline" className="text-xs">
                          {query.queryType.charAt(0).toUpperCase() + query.queryType.slice(1)}
                        </Badge>
                        <span className="text-gray-500">{formatDate(query.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{query.message}</p>
                      <div className="flex justify-between items-center">
                        {query.orderId && (
                          <span className="text-xs text-blue-600 font-mono">{query.orderId}</span>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedQuery(query)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Query Details</DialogTitle>
                            </DialogHeader>
                            {selectedQuery && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Name</label>
                                    <p className="text-gray-900">{selectedQuery.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-gray-900 break-all">{selectedQuery.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <p className="text-gray-900">{selectedQuery.phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Query Type</label>
                                    <p className="text-gray-900">{selectedQuery.queryType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Order ID</label>
                                    <p className="text-gray-900">{selectedQuery.orderId || "N/A"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Created</label>
                                    <p className="text-gray-900">{formatDate(selectedQuery.createdAt)}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Message</label>
                                  <Textarea value={selectedQuery.message} readOnly className="mt-1" rows={4} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select
                                      value={selectedQuery.status}
                                      onValueChange={(value) => updateQueryStatus(selectedQuery._id, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <Select
                                      value={selectedQuery.priority}
                                      onValueChange={(value) =>
                                        updateQueryStatus(selectedQuery._id, selectedQuery.status, value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Query Type</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queries.map((query) => (
                      <TableRow key={query._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{query.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-48">
                              {query.message.length > 50 ? `${query.message.substring(0, 50)}...` : query.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{query.email}</p>
                            <p className="text-gray-500">{query.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {query.queryType.charAt(0).toUpperCase() + query.queryType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {query.orderId ? (
                            <span className="text-blue-600 font-mono text-sm">{query.orderId}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(query.status)}</TableCell>
                        <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{formatDate(query.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedQuery(query)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Query Details</DialogTitle>
                                </DialogHeader>
                                {selectedQuery && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Name</label>
                                        <p className="text-gray-900">{selectedQuery.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-gray-900">{selectedQuery.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Phone</label>
                                        <p className="text-gray-900">{selectedQuery.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Query Type</label>
                                        <p className="text-gray-900">{selectedQuery.queryType}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Order ID</label>
                                        <p className="text-gray-900">{selectedQuery.orderId || "N/A"}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Created</label>
                                        <p className="text-gray-900">{formatDate(selectedQuery.createdAt)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Message</label>
                                      <Textarea value={selectedQuery.message} readOnly className="mt-1" rows={4} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                      <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-700">Status</label>
                                        <Select
                                          value={selectedQuery.status}
                                          onValueChange={(value) => updateQueryStatus(selectedQuery._id, value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-sm font-medium text-gray-700">Priority</label>
                                        <Select
                                          value={selectedQuery.priority}
                                          onValueChange={(value) =>
                                            updateQueryStatus(selectedQuery._id, selectedQuery.status, value)
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 px-3 sm:px-0">
                  <p className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(pagination.currentPage * 10, pagination.totalMessages)} of {pagination.totalMessages}{" "}
                    results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchQueries(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700 px-2">
                      {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchQueries(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
