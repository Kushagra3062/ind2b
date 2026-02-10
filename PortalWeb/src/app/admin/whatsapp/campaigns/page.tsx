"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus, Send, Edit, Trash2, Calendar, Users, MessageCircle, Target, Settings } from "lucide-react"

interface Campaign {
  _id: string
  title: string
  description: string
  messageTemplate: string
  targetAudience: "all" | "customers" | "sellers" | "custom"
  customerSegment?: {
    orderHistory?: "has_orders" | "no_orders" | "recent_orders" | "high_value" | "frequent_buyers"
    location?: string[]
    registrationDate?: {
      from?: string
      to?: string
    }
  }
  status: "draft" | "scheduled" | "sent" | "cancelled"
  sentCount: number
  deliveredCount: number
  failedCount: number
  scheduledAt?: string
  createdAt: string
  updatedAt: string
}

export default function WhatsAppCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showAdvancedSegmentation, setShowAdvancedSegmentation] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    targetAudience: "all",
    search: "",
  })
  const { toast } = useToast()

  // Form state for creating/editing campaigns
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    messageTemplate: "",
    targetAudience: "customers" as const,
    scheduledAt: "",
    customerSegment: {
      orderHistory: "has_orders" as const,
      location: [] as string[],
      registrationDate: {
        from: "",
        to: "",
      },
    },
  })

  // Available locations for segmentation
  const availableLocations = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "West Bengal",
    "Telangana",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
  ]

  useEffect(() => {
    fetchCampaigns()
  }, [filters])

  const fetchCampaigns = async () => {
    try {
      console.log("[v0] Starting to fetch campaigns...")
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.targetAudience !== "all") params.append("targetAudience", filters.targetAudience)

      const url = `/api/admin/whatsapp/campaigns?${params}`
      console.log("[v0] Fetching from URL:", url)

      const response = await fetch(url)
      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (data.success) {
        console.log("[v0] Setting campaigns:", data.data.campaigns)
        setCampaigns(data.data.campaigns)
      } else {
        console.log("[v0] API returned error:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to fetch campaigns",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching campaigns:", error)
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      const campaignData = {
        ...formData,
        customerSegment: showAdvancedSegmentation ? formData.customerSegment : undefined,
      }

      const response = await fetch("/api/admin/whatsapp/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Campaign created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          messageTemplate: "",
          targetAudience: "customers",
          scheduledAt: "",
          customerSegment: {
            orderHistory: "has_orders",
            location: [],
            registrationDate: { from: "", to: "" },
          },
        })
        setShowAdvancedSegmentation(false)
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      })
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch("/api/admin/whatsapp/campaigns/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Campaign sent to ${data.data.totalRecipients} recipients`,
        })
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending campaign:", error)
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return

    try {
      const response = await fetch(`/api/admin/whatsapp/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        })
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      })
    }
  }

  const handleLocationToggle = (location: string) => {
    const currentLocations = formData.customerSegment.location
    const updatedLocations = currentLocations.includes(location)
      ? currentLocations.filter((l) => l !== location)
      : [...currentLocations, location]

    setFormData({
      ...formData,
      customerSegment: {
        ...formData.customerSegment,
        location: updatedLocations,
      },
    })
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filters.search && !campaign.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Campaigns</h1>
          <p className="text-muted-foreground">Create and manage WhatsApp marketing campaigns</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Create a new WhatsApp marketing campaign to reach your customers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter campaign title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => setFormData({ ...formData, targetAudience: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customers">Customers Only</SelectItem>
                      <SelectItem value="sellers">Sellers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your campaign"
                  rows={3}
                />
              </div>

              {/* Advanced Segmentation Toggle */}
              {formData.targetAudience === "customers" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="advanced-segmentation"
                    checked={showAdvancedSegmentation}
                    onCheckedChange={setShowAdvancedSegmentation}
                  />
                  <Label htmlFor="advanced-segmentation" className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Enable Advanced Customer Segmentation</span>
                  </Label>
                </div>
              )}

              {/* Advanced Segmentation Options */}
              {showAdvancedSegmentation && formData.targetAudience === "customers" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Customer Segmentation</span>
                    </CardTitle>
                    <CardDescription>Target specific customer segments for better engagement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Order History</Label>
                      <Select
                        value={formData.customerSegment.orderHistory}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            customerSegment: { ...formData.customerSegment, orderHistory: value as any },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="has_orders">Customers with Orders</SelectItem>
                          <SelectItem value="no_orders">Customers without Orders</SelectItem>
                          <SelectItem value="recent_orders">Recent Orders (30 days)</SelectItem>
                          <SelectItem value="high_value">High-Value Customers (₹5000+)</SelectItem>
                          <SelectItem value="frequent_buyers">Frequent Buyers (3+ orders)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Location Filter</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                        {availableLocations.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${location}`}
                              checked={formData.customerSegment.location.includes(location)}
                              onCheckedChange={() => handleLocationToggle(location)}
                            />
                            <Label htmlFor={`location-${location}`} className="text-sm">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected: {formData.customerSegment.location.length} locations
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registrationFrom">Registration From</Label>
                        <Input
                          id="registrationFrom"
                          type="date"
                          value={formData.customerSegment.registrationDate.from}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerSegment: {
                                ...formData.customerSegment,
                                registrationDate: {
                                  ...formData.customerSegment.registrationDate,
                                  from: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationTo">Registration To</Label>
                        <Input
                          id="registrationTo"
                          type="date"
                          value={formData.customerSegment.registrationDate.to}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerSegment: {
                                ...formData.customerSegment,
                                registrationDate: {
                                  ...formData.customerSegment.registrationDate,
                                  to: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="messageTemplate">Message Template</Label>
                <Textarea
                  id="messageTemplate"
                  value={formData.messageTemplate}
                  onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                  placeholder="Hi {name}, we have exciting news for you! Check out our latest products..."
                  rows={4}
                />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Available personalization tokens:</strong>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <span>• {"{name}"} - Customer name</span>
                    <span>• {"{tier}"} - Customer tier</span>
                    <span>• {"{orderCount}"} - Total orders</span>
                    <span>• {"{lastOrderAmount}"} - Last order value</span>
                    <span>• {"{preferredProducts}"} - Preferred products</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>Create Campaign</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.targetAudience}
              onValueChange={(value) => setFilters({ ...filters, targetAudience: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="sellers">Sellers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Loading campaigns...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first WhatsApp marketing campaign to get started.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredCampaigns.map((campaign) => (
              <Card key={campaign._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{campaign.title}</CardTitle>
                      <CardDescription>{campaign.description}</CardDescription>
                      {campaign.customerSegment && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {campaign.customerSegment.orderHistory?.replace("_", " ")}
                          </Badge>
                          {campaign.customerSegment.location && campaign.customerSegment.location.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {campaign.customerSegment.location.length} locations
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">{getStatusBadge(campaign.status)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {campaign.targetAudience.charAt(0).toUpperCase() + campaign.targetAudience.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Sent: {campaign.sentCount}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">Delivered: {campaign.deliveredCount}</span>
                      </div>
                      {campaign.scheduledAt && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(campaign.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">{campaign.messageTemplate}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        {campaign.status === "draft" && (
                          <Button size="sm" onClick={() => handleSendCampaign(campaign._id)}>
                            <Send className="w-4 h-4 mr-1" />
                            Send Now
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
