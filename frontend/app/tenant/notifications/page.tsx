"use client"

import { useState } from 'react'
import { Bell, Check, X, AlertCircle, Info, AlertTriangle, Calendar, FileText, Droplets, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/shared/auth-provider'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Rent Payment Reminder',
      message: 'Your February rent payment is due on 5th February 2024',
      type: 'payment',
      icon: <CreditCard className="h-5 w-5 text-blue-500" />,
      date: '2024-01-28',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Water Reading Due',
      message: 'Please submit your water meter reading by 31st January',
      type: 'water',
      icon: <Droplets className="h-5 w-5 text-cyan-500" />,
      date: '2024-01-25',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Maintenance Completed',
      message: 'Your kitchen faucet repair has been completed',
      type: 'maintenance',
      icon: <AlertCircle className="h-5 w-5 text-green-500" />,
      date: '2024-01-20',
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      title: 'Building Notice',
      message: 'Water will be shut off for maintenance on 25th January, 2 PM - 4 PM',
      type: 'announcement',
      icon: <Info className="h-5 w-5 text-purple-500" />,
      date: '2024-01-18',
      read: true,
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Payment Received',
      message: 'Your January rent payment of KSh 15,000 has been received',
      type: 'payment',
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      date: '2024-01-05',
      read: true,
      priority: 'low'
    }
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    paymentReminders: true,
    maintenanceUpdates: true,
    buildingAnnouncements: true,
    waterReadingReminders: true
  })

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const toggleSetting = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto p-6 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/tenant/dashboard'}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Notifications</CardTitle>
                  <CardDescription>
                    {unreadCount > 0 
                      ? `${unreadCount} unread notifications` 
                      : 'All notifications read'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={markAllAsRead} variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm" className="text-red-500">
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${notification.read 
                          ? 'bg-secondary-800/30 border-secondary-700' 
                          : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {notification.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold mb-1 flex items-center gap-2">
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                  )}
                                  {notification.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">High</Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notification.date).toLocaleDateString()}
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
                        <p className="text-xs text-muted-foreground">
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
                          value ? 'bg-primary' : 'bg-secondary-700'
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
                
                <Button className="w-full">
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
                  <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/tenant/dashboard'}>
                    Back to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/payments">
                    Make a Payment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/tenant/water-calculator">
                    Water Calculator
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
