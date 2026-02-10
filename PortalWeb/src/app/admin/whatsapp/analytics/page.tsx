"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Send, CheckCircle, XCircle, TrendingUp, Calendar } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalCampaigns: number
    activeCampaigns: number
    sentCampaigns: number
    totalSent: number
    totalDelivered: number
    totalFailed: number
    deliveryRate: number
  }
  recentCampaigns: Array<{
    _id: string
    title: string
    status: string
    sentCount: number
    deliveredCount: number
    failedCount: number
    createdAt: string
  }>
  dailyStats: Array<{
    _id: string
    sent: number
    delivered: number
    failed: number
  }>
  period: number
}

export default function WhatsAppAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/whatsapp/analytics?period=${period}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch analytics",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const { overview, recentCampaigns, dailyStats } = analytics

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Analytics</h1>
          <p className="text-muted-foreground">Monitor your WhatsApp marketing campaign performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">{overview.activeCampaigns} active campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {overview.sentCampaigns} campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.totalDelivered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overview.deliveryRate}% delivery rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.totalFailed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overview.totalSent > 0 ? ((overview.totalFailed / overview.totalSent) * 100).toFixed(1) : 0}% failure
              rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaign Performance</CardTitle>
          <CardDescription>Performance metrics for your latest campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No campaigns found for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{campaign.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant={campaign.status === "sent" ? "default" : "secondary"}>{campaign.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{campaign.sentCount}</div>
                      <div className="text-muted-foreground">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{campaign.deliveredCount}</div>
                      <div className="text-muted-foreground">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{campaign.failedCount}</div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">
                        {campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : 0}
                        %
                      </div>
                      <div className="text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Message Statistics</CardTitle>
          <CardDescription>Daily breakdown of message delivery for the last {period} days</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No daily statistics available for the selected period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyStats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    {new Date(stat._id).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Send className="w-3 h-3 text-blue-600" />
                      <span>{stat.sent} sent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>{stat.delivered} delivered</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span>{stat.failed} failed</span>
                    </div>
                    <div className="font-medium">
                      {stat.sent > 0 ? ((stat.delivered / stat.sent) * 100).toFixed(1) : 0}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
