"use client"

import { useState, useEffect } from 'react'
import {
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  Download,
  Upload,
  Receipt,
  Droplets,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { BalanceCard } from '@/components/tenant/balance-card'
import { QuickStats } from '@/components/tenant/quick-stats'
import { useAuth } from '@/components/shared/auth-provider'
import { tenantApi } from '@/lib/api/tenant'
import { paymentApi } from '@/lib/api/payment'
import { useToast } from '@/lib/hooks/use-toast'

export default function TenantDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [waterUnits, setWaterUnits] = useState(5)
  const [waterBill, setWaterBill] = useState(750)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    setWaterBill(waterUnits * 150)
  }, [waterUnits])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching tenant dashboard data...')
      
      // Fetch tenant dashboard
      const dashboardResponse = await tenantApi.getDashboard()
      console.log('📊 Dashboard response:', dashboardResponse)
      
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data)
      }

      // Fetch recent payments - FIXED: Removed sortBy and sortOrder parameters
      const paymentsResponse = await paymentApi.getTenantPayments({ 
        limit: 3
      })
      
      if (paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
        setRecentPayments(paymentsResponse.data)
      }

      // Fallback if API returns no data
      if (!dashboardResponse.data && paymentsResponse.data.length === 0) {
        toast({
          title: 'Info',
          description: 'No recent activity found. Submit your first payment to see data here.',
          variant: 'default'
        })
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      })
      
      // Set fallback data
      setDashboardData({
        tenant: {
          name: user?.name || 'Tenant',
          apartment: user?.apartment || 'N/A',
          rentAmount: 15000,
          balance: 0
        },
        statistics: {
          totalBalance: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          unpaidWaterAmount: 0,
          activeMaintenanceRequests: 0
        },
        currentMonth: {
          rentPaid: false,
          waterDue: 750
        }
      })
      
      setRecentPayments([
        {
          id: '1',
          month: '2024-01',
          amount: 15000,
          type: 'RENT',
          status: 'VERIFIED',
          createdAt: '2024-01-05T00:00:00.000Z'
        }
      ])
      
    } finally {
      setLoading(false)
    }
  }

  const getUpcomingPayments = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    return [
      {
        id: '1',
        dueDate: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-05`,
        amount: dashboardData?.tenant?.rentAmount || 15000,
        type: 'Rent'
      },
      {
        id: '2',
        dueDate: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-10`,
        amount: waterBill,
        type: 'Water'
      }
    ]
  }

  const getRecentActivities = () => {
    const activities: any[] = []

    // Add payment activities
    recentPayments.forEach(payment => {
      activities.push({
        id: payment.id,
        type: 'payment',
        title: `${payment.type} Payment ${payment.status === 'VERIFIED' ? 'Verified' : 'Submitted'}`,
        description: `${payment.type} payment for ${payment.month}`,
        date: payment.createdAt,
        user: user?.name || 'You',
        apartment: user?.apartment,
        amount: payment.amount,
        status: payment.status === 'VERIFIED' ? 'success' : 'warning'
      })
    })

    // Add system activities
    if (dashboardData?.currentMonth?.waterDue > 0) {
      activities.push({
        id: 'water-bill',
        type: 'water',
        title: 'Water Bill Generated',
        description: `Current water bill: KSh ${dashboardData.currentMonth.waterDue}`,
        date: new Date().toISOString(),
        amount: dashboardData.currentMonth.waterDue,
        status: 'info'
      })
    }

    if (dashboardData?.statistics?.pendingPayments > 0) {
      activities.push({
        id: 'pending-payment',
        type: 'alert',
        title: 'Payment Pending',
        description: `${dashboardData.statistics.pendingPayments} payment(s) pending verification`,
        date: new Date().toISOString(),
        status: 'warning'
      })
    }

    // Sort by date
    return activities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {dashboardData?.tenant?.name || user?.name || 'Tenant'}!
            </h1>
            <p className="text-muted-foreground">
              Apartment {dashboardData?.tenant?.apartment || user?.apartment || 'N/A'} • 
              Last login: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Overview */}
            <BalanceCard 
              currentBalance={dashboardData?.statistics?.totalBalance || 0}
              totalPaid={45000} // You might want to calculate this from payments
              totalDue={(dashboardData?.tenant?.rentAmount || 0) + waterBill}
              nextPaymentDate={getUpcomingPayments()[0]?.dueDate}
            />

            {/* Quick Actions */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your payments and documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/tenant/payments/new">
                    <Button className="w-full h-24 flex-col gap-3 bg-primary/10 hover:bg-primary/20 border border-primary/20">
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="font-medium">Upload Payment</span>
                    </Button>
                  </Link>

                  <Link href="/tenant/receipts">
                    <Button className="w-full h-24 flex-col gap-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20">
                      <Receipt className="h-6 w-6 text-green-500" />
                      <span className="font-medium">View Receipts</span>
                    </Button>
                  </Link>

                  <Link href="/tenant/water-calculator">
                    <Button className="w-full h-24 flex-col gap-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20">
                      <Droplets className="h-6 w-6 text-blue-500" />
                      <span className="font-medium">Water Calculator</span>
                    </Button>
                  </Link>

                  <Link href="/tenant/instructions">
                    <Button className="w-full h-24 flex-col gap-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20">
                      <FileText className="h-6 w-6 text-yellow-500" />
                      <span className="font-medium">Instructions</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your last {recentPayments.length} payment transactions</CardDescription>
                </div>
                <Link href="/tenant/payments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No payment history yet</p>
                    <Link href="/tenant/payments/new">
                      <Button>Make Your First Payment</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"     
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {payment.type} Payment - {payment.month}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">KSh {payment.amount?.toLocaleString()}</p>
                          <Badge 
                            className={`mt-1 ${
                              payment.status === 'VERIFIED' ? 'bg-green-500' :
                              payment.status === 'PENDING' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <QuickStats 
              rentAmount={dashboardData?.tenant?.rentAmount || 15000}
              waterBill={waterBill}
              daysInApartment={dashboardData?.tenant?.moveInDate ? 
                Math.floor((new Date().getTime() - new Date(dashboardData.tenant.moveInDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              lastPaymentDate={recentPayments[0]?.createdAt}
              paymentsThisMonth={recentPayments.length}
              pendingPayments={dashboardData?.statistics?.pendingPayments || 0}
            />

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Next payment due dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingPayments().map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{payment.type}</span>
                        <Badge variant="outline">
                          Due {new Date(payment.dueDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          KSh {payment.amount.toLocaleString()}
                        </span>
                        <Link href="/tenant/payments/new">
                          <Button size="sm" variant="outline">
                            Pay Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Payment Reminder</p>
                      <p className="text-sm text-gray-600">
                        Ensure payments are made by the 5th of each month to avoid late fees.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Water Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Water Usage</CardTitle>
                <CardDescription>Current month consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Units Consumed</p>
                      <p className="text-2xl font-bold">{waterUnits} units</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWaterUnits(prev => Math.max(0, prev - 1))}
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWaterUnits(prev => prev + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Bill Calculation</span>
                      <span className="font-medium">KSh {waterBill.toLocaleString()}</span>
                    </div>
                    <Progress value={(waterUnits / 20) * 100} className="h-2" />
                    <p className="text-xs text-gray-500 mt-2">
                      Rate: KSh 150 per unit • {waterUnits} × 150 = KSh {waterBill}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - FIXED: Removed showRefresh prop */}
            <RecentActivity 
              activities={getRecentActivities()} 
              limit={4}
            />
          </div>
        </div>
      </main>
    </div>
  )
}