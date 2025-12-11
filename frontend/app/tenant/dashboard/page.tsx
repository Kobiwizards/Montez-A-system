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
  Droplets
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

export default function TenantDashboard() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(15000)
  const [waterUnits, setWaterUnits] = useState(0)
  const [waterBill, setWaterBill] = useState(0)

  // Mock data
  const recentPayments = [
    { id: 1, month: 'January 2024', amount: 15000, status: 'Paid', date: '2024-01-05' },
    { id: 2, month: 'December 2023', amount: 15000, status: 'Paid', date: '2023-12-05' },
    { id: 3, month: 'November 2023', amount: 15000, status: 'Paid', date: '2023-11-05' },
  ]

  const upcomingPayments = [
    { id: 1, dueDate: '2024-02-05', amount: 15000, type: 'Rent' },
    { id: 2, dueDate: '2024-02-10', amount: 750, type: 'Water' },
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'payment' as const,
      title: 'Rent Payment Submitted',
      description: 'January rent payment of KSh 15,000 submitted',
      date: '2024-01-05',
      user: user?.name || 'You',
      apartment: user?.apartment,
      amount: 15000,
      status: 'success' as const
    },
    {
      id: '2',
      type: 'maintenance' as const,
      title: 'Maintenance Request',
      description: 'Leaking faucet in kitchen reported',
      date: '2024-01-10',
      apartment: user?.apartment,
      status: 'info' as const
    },
    {
      id: '3',
      type: 'notification' as const,
      title: 'Water Reading Reminder',
      description: 'Submit water meter reading by end of month',
      date: '2024-01-15',
      status: 'warning' as const
    },
    {
      id: '4',
      type: 'water' as const,
      title: 'Water Bill Generated',
      description: 'December water bill: 5 units @ KSh 150',
      date: '2024-01-01',
      amount: 750,
      status: 'info' as const
    }
  ]

  useEffect(() => {
    // Calculate water bill
    setWaterBill(waterUnits * 150)
  }, [waterUnits])

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'Tenant'}!
          </h1>
          <p className="text-muted-foreground">
            Apartment {user?.apartment} • Last login: Today, 10:30 AM
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Overview */}
            <BalanceCard 
              currentBalance={balance}
              totalPaid={45000}
              totalDue={15000}
              nextPaymentDate="2024-02-05"
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
                    <Button className="w-full h-24 flex-col gap-3 bg-success/10 hover:bg-success/20 border border-success/20">
                      <Receipt className="h-6 w-6 text-success" />
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
                    <Button className="w-full h-24 flex-col gap-3 bg-warning/10 hover:bg-warning/20 border border-warning/20">
                      <FileText className="h-6 w-6 text-warning" />
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
                  <CardDescription>Your last 3 payment transactions</CardDescription>
                </div>
                <Link href="/tenant/payments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-secondary-700 hover:bg-secondary-800/50 transition-colors"     
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.month} Rent</p>
                          <p className="text-sm text-muted-foreground">
                            Paid on {payment.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KSh {payment.amount.toLocaleString()}</p>
                        <Badge variant="success" className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <QuickStats />

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Next payment due dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-lg border border-secondary-700 bg-secondary-800/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{payment.type}</span>
                        <Badge variant="outline">
                          Due {payment.dueDate}
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

                <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Payment Reminder</p>
                      <p className="text-sm text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">Units Consumed</p>
                      <p className="text-2xl font-bold">{waterUnits} units</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaterUnits(prev => prev + 1)}
                    >
                      Add Unit
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Bill Calculation</span>
                      <span>KSh {waterBill.toLocaleString()}</span>
                    </div>
                    <Progress value={(waterUnits / 10) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Rate: KSh 150 per unit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - ADDED */}
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </main>
    </div>
  )
}
