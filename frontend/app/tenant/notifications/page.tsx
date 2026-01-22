"use client"

import { useState, useEffect } from 'react'
import { Bell, Check, X, AlertCircle, Info, AlertTriangle, Calendar, FileText, Droplets, CreditCard, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/shared/auth-provider'
import { paymentApi } from '@/lib/api/payment'
import { tenantApi } from '@/lib/api/tenant'
import { useToast } from '@/lib/hooks/use-toast'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'water' | 'announcement' | 'alert';
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  apartment?: string;
  amount?: number;
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    paymentReminders: true,
    maintenanceUpdates: true,
    buildingAnnouncements: true,
    waterReadingReminders: true
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching notifications...')
      
      const allNotifications: Notification[] = []

      // Fetch payments for payment notifications
      try {
        const paymentsResponse = await paymentApi.getTenantPayments({ limit: 10 })
        
        if (paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
          paymentsResponse.data.forEach(payment => {
            if (payment.status === 'PENDING') {
              allNotifications.push({
                id: `payment-${payment.id}`,
                title: 'Payment Pending Verification',
                message: `Your ${payment.type} payment of KSh ${payment.amount} for ${payment.month} is pending verification`,
                type: 'payment',
                date: payment.createdAt,
                read: false,
                priority: 'medium',
                apartment: user?.apartment,
                amount: payment.amount
              })
            } else if (payment.status === 'VERIFIED') {
              allNotifications.push({
                id: `payment-verified-${payment.id}`,
                title: 'Payment Verified',
                message: `Your ${payment.type} payment for ${payment.month} has been verified`,
                type: 'payment',
                date: payment.updatedAt || payment.createdAt,
                read: false,
                priority: 'low',
                apartment: user?.apartment,
                amount: payment.amount
              })
            }
          })
        }
      } catch (error) {
        console.error('Error fetching payments for notifications:', error)
      }

      // Add system notifications
      const currentDate = new Date()
      const nextRentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5)
      const daysUntilRent = Math.ceil((nextRentDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilRent <= 7) {
        allNotifications.push({
          id: 'rent-reminder',
          title: 'Rent Payment Reminder',
          message: `Your rent payment is due in ${daysUntilRent} days on ${nextRentDate.toLocaleDateString()}`,
          type: 'payment',
          date: currentDate.toISOString(),
          read: false,
          priority: daysUntilRent <= 3 ? 'high' : 'medium',
          apartment: user?.apartment
        })
      }

      // Add water reading reminder at end of month
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const daysUntilMonthEnd = lastDayOfMonth.getDate() - currentDate.getDate()
      
      if (daysUntilMonthEnd <= 3) {
        allNotifications.push({
          id: 'water-reminder',
          title: 'Water Reading Due',
          message: 'Please submit your water meter reading by end of month',
          type: 'water',
          date: currentDate.toISOString(),
          read: false,
          priority: 'medium',
          apartment: user?.apartment
        })
      }

      // Add building announcements
      allNotifications.push({
        id: 'building-notice',
        title: 'Building Maintenance Notice',
        message: 'Water will be shut off for maintenance on 25th January, 2 PM - 4 PM',
        type: 'announcement',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium'
      })

      // Sort by date and priority
      const sortedNotifications = allNotifications.sort((a, b) => {
        // Unread first
        if (a.read !== b.read) return a.read ? 1 : -1
        
        // High priority first
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        
        // Recent first
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })

      console.log(`✅ Loaded ${sortedNotifications.length} notifications`)
      setNotifications(sortedNotifications)
      
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
      
      // Fallback to sample data
      setNotifications([
        {
          id: '1',
          title: 'Rent Payment Reminder',
          message: 'Your February rent payment is due on 5th February 2024',
          type: 'payment',
          date: new Date().toISOString(),
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Water Reading Due',
          message: 'Please submit your water meter reading by 31st January',
          type: 'water',
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: false,
          priority: 'medium'
        }
      ])
      
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
    toast({
      title: 'Deleted',
      description: 'Notification removed',
    })
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
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case 'maintenance':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'water':
        return <Droplets className="h-5 w-5 text-cyan-500" />
      case 'announcement':
        return <Info className="h-5 w-5 text-purple-500" />
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const toggleSetting = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    paymentAlerts: notifications.filter(n => n.type === 'payment').length,
    highPriority: notifications.filter(n => n.priority === 'high').length,
    today: notifications.filter(n => 
      new Date(n.date).toDateString() === new Date().toDateString()
    ).length
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto p-6 max-w-6xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with important messages and reminders
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
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Notifications</CardTitle>
                  <CardDescription>
                    {loading ? 'Loading notifications...' : 
                     unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </CardDescription>
                </div>
                {notifications.length > 0 && (
                  <Button onClick={clearAll} variant="outline" size="sm" className="text-red-500">
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
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
                    <p className="text-muted-foreground">You're all caught up!</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={fetchNotifications}
                    >
                      Refresh
                    </Button>
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

          {/* Right Column - Settings */}
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
                    <span className="text-sm">High Priority</span>
                    <Badge variant="destructive" className="text-xs">
                      {stats.highPriority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today</span>
                    <span className="font-medium">{stats.today}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {key.includes('email') ? 'Receive email notifications' : 
                           key.includes('push') ? 'Receive browser notifications' :
                           key.includes('payment') ? 'Get payment reminders' :
                           key.includes('maintenance') ? 'Maintenance update alerts' :
                           key.includes('building') ? 'Building announcements' :
                           'Water reading reminders'}
                        </p>
                      </div>
                      <button
                        id={key}
                        onClick={() => toggleSetting(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <Button className="w-full" onClick={() => {
                  toast({
                    title: 'Settings Saved',
                    description: 'Your notification preferences have been updated',
                  })
                }}>
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/payments/new">
                    Make a Payment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/water-calculator">
                    Water Calculator
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/payments">
                    View Payment History
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}