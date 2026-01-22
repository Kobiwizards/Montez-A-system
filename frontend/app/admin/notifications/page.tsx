"use client"

import { useState, useEffect } from 'react'
import { Bell, Check, X, AlertCircle, Users, DollarSign, Home, Wrench, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/lib/hooks/use-toast'
import { paymentApi } from '@/lib/api/payment'
import { tenantApi } from '@/lib/api/tenant'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'water' | 'notification' | 'alert' | 'tenant';
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  apartment?: string;
  amount?: number;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching notifications...')
      
      const allNotifications: Notification[] = []

      // Fetch pending payments for notifications
      try {
        const paymentsResponse = await paymentApi.getPendingPayments({ limit: 20 })
        
        if (paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
          paymentsResponse.data.forEach(payment => {
            allNotifications.push({
              id: `payment-${payment.id}`,
              title: 'Payment Pending Verification',
              message: `${payment.tenant?.name || 'Tenant'} submitted ${payment.type} payment for ${payment.month}`,
              type: 'payment',
              date: payment.createdAt,
              read: false,
              priority: 'medium',
              apartment: payment.tenant?.apartment,
              amount: payment.amount
            })
          })
        }
      } catch (error) {
        console.error('Error fetching payments for notifications:', error)
      }

      // Fetch tenants with overdue balances
      try {
        const tenantsResponse = await tenantApi.getAllTenants({ limit: 100 })
        
        if (tenantsResponse.data && Array.isArray(tenantsResponse.data)) {
          tenantsResponse.data.forEach(tenant => {
            if (tenant.balance > 0) {
              allNotifications.push({
                id: `balance-${tenant.id}`,
                title: 'Overdue Balance Alert',
                message: `${tenant.name} in ${tenant.apartment} has overdue balance of KSh ${tenant.balance.toLocaleString()}`,
                type: 'alert',
                date: new Date().toISOString(),
                read: false,
                priority: tenant.balance > tenant.rentAmount ? 'high' : 'medium',
                apartment: tenant.apartment,
                amount: tenant.balance
              })
            }
          })
        }
      } catch (error) {
        console.error('Error fetching tenants for notifications:', error)
      }

      // Add system notifications
      const systemNotifications: Notification[] = [
        {
          id: 'water-due',
          title: 'Water Readings Due',
          message: 'Monthly water meter readings due by end of month',
          type: 'water',
          date: new Date().toISOString(),
          read: false,
          priority: 'medium'
        },
        {
          id: 'month-end',
          title: 'Month End Reminder',
          message: 'Rent collection and reporting due in 3 days',
          type: 'notification',
          date: new Date().toISOString(),
          read: false,
          priority: 'high'
        }
      ]

      const combinedNotifications = [...allNotifications, ...systemNotifications]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      console.log(`✅ Loaded ${combinedNotifications.length} notifications`)
      setNotifications(combinedNotifications)
      
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
    toast({
      title: 'Success',
      description: 'All notifications marked as read',
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    toast({
      title: 'Cleared',
      description: 'All notifications removed',
    })
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-5 w-5 text-blue-500" />
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-orange-500" />
      case 'water':
        return <AlertCircle className="h-5 w-5 text-cyan-500" />
      case 'tenant':
        return <Users className="h-5 w-5 text-green-500" />
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-purple-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    paymentAlerts: notifications.filter(n => n.type === 'payment').length,
    balanceAlerts: notifications.filter(n => n.type === 'alert').length,
    maintenance: notifications.filter(n => n.type === 'maintenance').length,
    highPriority: notifications.filter(n => n.priority === 'high').length
  }

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
                <Bell className="h-8 w-8" />
                Admin Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2" variant="destructive">
                    {unreadCount} new
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                Real-time alerts and system notifications
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {notifications.length > 0 && (
                <>
                  <Button onClick={markAllAsRead} variant="outline">
                    <Check className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="text-red-500">
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notifications List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Building Notifications</CardTitle>
                  <CardDescription>
                    {loading ? 'Loading notifications...' : 
                     unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading notifications...</p>
                      </div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                      <p className="text-muted-foreground">All systems are running smoothly!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                                    {notification.title}
                                    {!notification.read && (
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    )}
                                    {notification.priority === 'high' && (
                                      <Badge variant="destructive" className="text-xs">High Priority</Badge>
                                    )}
                                    {notification.apartment && (
                                      <Badge variant="outline" className="text-xs">
                                        Apt {notification.apartment}
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {notification.message}
                                  </p>
                                  {notification.amount && (
                                    <p className="text-sm font-medium text-gray-800">
                                      Amount: KSh {notification.amount.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    {formatDate(notification.date, 'short')}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    {!notification.read && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => markAsRead(notification.id)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Mark read
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="h-6 px-2 text-xs text-red-500"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
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
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Notifications</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unread</span>
                      <Badge variant={unreadCount > 0 ? "destructive" : "outline"}>
                        {unreadCount}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Alerts</span>
                      <span className="font-medium">{stats.paymentAlerts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Balance Alerts</span>
                      <span className="font-medium">{stats.balanceAlerts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Priority</span>
                      <Badge variant="destructive" className="text-xs">
                        {stats.highPriority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/dashboard">
                      Admin Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/tenants">
                      Manage Tenants
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/payments">
                      View Payments
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Send Bulk Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}