"use client"

import { useState } from 'react'
import { Bell, Check, X, AlertCircle, Users, DollarSign, Home, Wrench, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/shared/auth-provider'

export default function AdminNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Late Payment Alert',
      message: 'Apartment 1A2 has not paid February rent (5 days overdue)',
      type: 'payment',
      icon: <DollarSign className="h-5 w-5 text-red-500" />,
      date: '2024-01-30',
      read: false,
      priority: 'high',
      apartment: '1A2'
    },
    {
      id: 2,
      title: 'New Tenant Registration',
      message: 'John Doe has registered for Apartment 3B1',
      type: 'tenant',
      icon: <Users className="h-5 w-5 text-green-500" />,
      date: '2024-01-28',
      read: false,
      priority: 'medium',
      apartment: '3B1'
    },
    {
      id: 3,
      title: 'Maintenance Request',
      message: 'Leaking pipe reported in Apartment 2A1 bathroom',
      type: 'maintenance',
      icon: <Wrench className="h-5 w-5 text-orange-500" />,
      date: '2024-01-27',
      read: true,
      priority: 'medium',
      apartment: '2A1'
    },
    {
      id: 4,
      title: 'Water Reading Missing',
      message: '5 apartments have not submitted January water readings',
      type: 'water',
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
      date: '2024-01-25',
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      title: 'Payment Received',
      message: 'Apartment 4A2 paid KSh 18,000 for February rent',
      type: 'payment',
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      date: '2024-01-24',
      read: true,
      priority: 'low',
      apartment: '4A2'
    }
  ])

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

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto p-6 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin/dashboard">
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
            Admin Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2" variant="destructive">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage building alerts and tenant notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <Card className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Building Notifications</CardTitle>
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
                    <p className="text-muted-foreground">All caught up with building management!</p>
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
                                  {notification.apartment && (
                                    <Badge variant="outline" className="text-xs">
                                      Apt {notification.apartment}
                                    </Badge>
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Notifications</span>
                    <span className="font-medium">{notifications.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unread</span>
                    <Badge variant="destructive">{unreadCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Alerts</span>
                    <span className="font-medium">
                      {notifications.filter(n => n.type === 'payment').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintenance</span>
                    <span className="font-medium">
                      {notifications.filter(n => n.type === 'maintenance').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tenant Related</span>
                    <span className="font-medium">
                      {notifications.filter(n => n.type === 'tenant').length}
                    </span>
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
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/maintenance">
                    Maintenance Requests
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
