"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, RefreshCw, MessageSquare, Star, TrendingUp } from 'lucide-react'
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Feedback {
  _id: string
  name: string
  email: string
  category: string
  message: string
  emoji: number
  vibeLabel: string
  vibeValue: string
  createdAt: string
  updatedAt: string
}

interface FeedbackStats {
  totalFeedbacks: number
  avgEmoji: number
  categoryData: Array<{ category: string; count: number }>
  vibeData: Array<{ vibeLabel: string; count: number }>
}

interface FeedbackData {
  feedbacks: Feedback[]
  pagination: {
    currentPage: number
    totalPages: number
    totalFeedbacks: number
    limit: number
  }
  filters: {
    categories: string[]
    vibeLabels: string[]
  }
  stats: FeedbackStats
}

export default function AdminFeedbacksPage() {
  const [data, setData] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Filter states
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedVibeLabel, setSelectedVibeLabel] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFeedbacks = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedVibeLabel !== "all" && { vibeLabel: selectedVibeLabel })
      })

      const response = await fetch(`/api/admin/feedbacks?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        if (showRefreshToast) {
          toast.success("Feedbacks refreshed successfully!")
        }
      } else {
        toast.error("Failed to fetch feedbacks")
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      toast.error("Error fetching feedbacks")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [currentPage, search, selectedCategory, selectedVibeLabel])

  const handleRefresh = () => {
    fetchFeedbacks(true)
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("all")
    setSelectedVibeLabel("all")
    setCurrentPage(1)
  }

  const getEmojiDisplay = (emoji: number) => {
    const emojiMap: { [key: number]: string } = {
      1: "😢",
      2: "😕", 
      3: "😐",
      4: "😊",
      5: "😍"
    }
    return emojiMap[emoji] || "😐"
  }

  const getVibeColor = (vibeLabel: string) => {
    switch (vibeLabel.toLowerCase()) {
      case "happy": return "bg-green-100 text-green-800"
      case "sad": return "bg-red-100 text-red-800"
      case "neutral": return "bg-gray-100 text-gray-800"
      case "excited": return "bg-blue-100 text-blue-800"
      case "angry": return "bg-red-200 text-red-900"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "feature request": return "bg-blue-100 text-blue-800"
      case "bug report": return "bg-red-100 text-red-800"
      case "general feedback": return "bg-green-100 text-green-800"
      case "complaint": return "bg-orange-100 text-orange-800"
      default: return "bg-purple-100 text-purple-800"
    }
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Customer Feedbacks</h1>
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Customer Feedbacks</h1>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Failed to load feedbacks</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Customer Feedbacks</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and review customer feedback</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Feedbacks</CardTitle>
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{data.stats.totalFeedbacks}</div>
            <p className="text-xs text-muted-foreground">All time feedbacks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {data.stats.avgEmoji.toFixed(1)} <span className="text-base sm:text-xl">{getEmojiDisplay(Math.round(data.stats.avgEmoji))}</span>
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{data.filters.categories.length}</div>
            <p className="text-xs text-muted-foreground">Feedback categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Sentiment Types</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{data.filters.vibeLabels.length}</div>
            <p className="text-xs text-muted-foreground">Different sentiments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data.filters.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedVibeLabel} onValueChange={setSelectedVibeLabel}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Sentiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  {data.filters.vibeLabels.map((vibe) => (
                    <SelectItem key={vibe} value={vibe}>
                      {vibe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Feedbacks ({data.pagination.totalFeedbacks})</CardTitle>
          <CardDescription className="text-sm">
            Showing {((data.pagination.currentPage - 1) * data.pagination.limit) + 1} to{" "}
            {Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.totalFeedbacks)} of{" "}
            {data.pagination.totalFeedbacks} feedbacks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3 p-3">
            {data.feedbacks.map((feedback) => (
              <Card key={feedback._id} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{feedback.name}</p>
                      <p className="text-xs text-gray-500 truncate">{feedback.email}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Badge className={`${getCategoryColor(feedback.category)} text-xs`}>
                        {feedback.category.length > 10 ? feedback.category.substring(0, 10) + '...' : feedback.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getEmojiDisplay(feedback.emoji)}</span>
                      <span className="text-xs text-gray-600">{feedback.emoji}/5</span>
                    </div>
                    <Badge className={`${getVibeColor(feedback.vibeLabel)} text-xs`}>
                      {feedback.vibeLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{feedback.message}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}</span>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.feedbacks.map((feedback) => (
                  <TableRow key={feedback._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{feedback.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-48">{feedback.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(feedback.category)}>
                        {feedback.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={feedback.message}>
                        {feedback.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getEmojiDisplay(feedback.emoji)}</span>
                        <span className="text-sm text-gray-600">{feedback.emoji}/5</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getVibeColor(feedback.vibeLabel)}>
                        {feedback.vibeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 px-3 sm:px-0">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={data.pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
                  disabled={data.pagination.currentPage === data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
