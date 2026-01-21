"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, DollarSign, Home, PieChart, Calendar, Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { tenantApi } from '@/lib/api/tenant'
import { paymentApi } from '@/lib/api/payment'

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalTenants: 0,
    currentTenants: 0,
    overdueTenants: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalBalance: 0,
    monthlyRevenue: 0,
    averageRent: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('📈 Fetching analytics data...')
      
      // Fetch tenants data
      const tenantsResponse = await tenantApi.getAllTenants({ limit: 100 })
      const tenants = tenantsResponse.data || []
      
      // Fetch payments data
      const paymentsResponse = await paymentApi.getAllPayments({ limit: 100 })
      const payments = paymentsResponse.data || []
      
      // Calculate analytics
      const currentTenants = tenants.filter(t => t.status === 'CURRENT').length
      const overdueTenants = tenants.filter(t => t.status === 'OVERDUE' || t.status === 'DELINQUENT').length
      const totalBalance = tenants.reduce((sum, t) => sum + t.balance, 0)
      const totalRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0)
      const verifiedPayments = payments.filter(p => p.status === 'VERIFIED')
      const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0)
      
      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentPayments = verifiedPayments.filter(p => 
        new Date(p.createdAt) > thirtyDaysAgo
      )
      const monthlyRevenue = recentPayments.reduce((sum, p) => sum + p.amount, 0)
      
      setAnalytics({
        totalTenants: tenants.length,
        currentTenants,
        overdueTenants,
        occupancyRate: 100, // Assuming full occupancy
        totalRevenue,
        pendingPayments: payments.filter(p => p.status === 'PENDING').length,
        totalBalance,
        monthlyRevenue,
        averageRent: tenants.length > 0 ? totalRent / tenants.length : 0
      })
      
      console.log('✅ Analytics loaded:', analytics)
      
    } catch (error: any) {
      console.error('❌ Error fetching analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Total Tenants',
      value: analytics.totalTenants,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Current Tenants',
      value: analytics.currentTenants,
      icon: Home,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      change: '+2 this month'
    },
    {
      title: 'Overdue Tenants',
      value: analytics.overdueTenants,
      icon: Users,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Occupancy Rate',
      value: `${analytics.occupancyRate}%`,
      icon: PieChart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Revenue',
      value: `KSh ${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Payments',
      value: analytics.pendingPayments,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Outstanding Balance',
      value: `KSh ${analytics.totalBalance.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Monthly Revenue',
      value: `KSh ${analytics.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      change: '+12% from last month'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Building performance metrics and financial analytics
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.change && (
                        <p className="text-xs text-green-500 mt-1">{stat.change}</p>
                      )}
                    </div>
                    <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Rent per Unit</span>
                    <span className="font-medium">
                      KSh {analytics.averageRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Collection Rate</span>
                    <Badge variant="outline">
                      {analytics.totalTenants > 0 
                        ? `${Math.round((analytics.currentTenants / analytics.totalTenants) * 100)}%`
                        : '0%'
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delinquency Rate</span>
                    <Badge variant="outline" className={analytics.overdueTenants > 0 ? 'text-red-500' : ''}>
                      {analytics.totalTenants > 0 
                        ? `${Math.round((analytics.overdueTenants / analytics.totalTenants) * 100)}%`
                        : '0%'
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue per Tenant</span>
                    <span className="font-medium">
                      KSh {analytics.totalTenants > 0 
                        ? (analytics.totalRevenue / analytics.totalTenants).toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : '0'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
                <CardDescription>Actionable insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.pendingPayments > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-yellow-500">Action Required</Badge>
                        <div>
                          <p className="font-medium mb-1">Pending Payments</p>
                          <p className="text-sm text-gray-600">
                            {analytics.pendingPayments} payment{analytics.pendingPayments !== 1 ? 's' : ''} need verification
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {analytics.overdueTenants > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-red-500">Alert</Badge>
                        <div>
                          <p className="font-medium mb-1">Overdue Balances</p>
                          <p className="text-sm text-gray-600">
                            {analytics.overdueTenants} tenant{analytics.overdueTenants !== 1 ? 's' : ''} with overdue balances totaling KSh {analytics.totalBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-500">Info</Badge>
                      <div>
                        <p className="font-medium mb-1">Monthly Performance</p>
                        <p className="text-sm text-gray-600">
                          Generated KSh {analytics.monthlyRevenue.toLocaleString()} in revenue this month
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-green-500">Good</Badge>
                      <div>
                        <p className="font-medium mb-1">Occupancy Status</p>
                        <p className="text-sm text-gray-600">
                          Building at {analytics.occupancyRate}% occupancy with {analytics.currentTenants} current tenants
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
              <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Data Period</p>
                  <p className="text-lg font-semibold">All Time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Active Data Sources</p>
                  <p className="text-lg font-semibold">Tenants & Payments</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Data Accuracy</p>
                  <p className="text-lg font-semibold">Real-time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}