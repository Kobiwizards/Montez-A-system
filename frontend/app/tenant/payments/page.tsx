"use client"

import { useState } from 'react'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  Banknote
} from 'lucide-react'

interface Payment {
  id: string
  month: string
  amount: number
  type: 'rent' | 'water' | 'other'
  status: 'verified' | 'pending' | 'rejected'
  method: 'mpesa' | 'cash'
  date: string
  transactionCode?: string
  caretaker?: string
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all')

  // Mock payments data
  const payments: Payment[] = [
    {
      id: '1',
      month: 'January 2024',
      amount: 15000,
      type: 'rent',
      status: 'verified',
      method: 'mpesa',
      date: '2024-01-05',
      transactionCode: 'RF48H9J2K3'
    },
    {
      id: '2',
      month: 'December 2023',
      amount: 15000,
      type: 'rent',
      status: 'verified',
      method: 'cash',
      date: '2023-12-05',
      caretaker: 'Mwarabu'
    },
    {
      id: '3',
      month: 'November 2023',
      amount: 15000,
      type: 'rent',
      status: 'verified',
      method: 'mpesa',
      date: '2023-11-05',
      transactionCode: 'RF48H9J2K4'
    },
    {
      id: '4',
      month: 'January 2024',
      amount: 750,
      type: 'water',
      status: 'pending',
      method: 'mpesa',
      date: '2024-01-10',
      transactionCode: 'RF48H9J2K5'
    },
    {
      id: '5',
      month: 'February 2024',
      amount: 15000,
      type: 'rent',
      status: 'pending',
      method: 'cash',
      date: '2024-02-01',
      caretaker: 'Mwarabu'
    }
  ]

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.month.toLowerCase().includes(search.toLowerCase()) ||
      (payment.transactionCode && payment.transactionCode.toLowerCase().includes(search.toLowerCase()))
    
    const matchesFilter = filter === 'all' || payment.status === filter
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>
      case 'pending':
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-4 w-4 text-blue-500" />
      case 'cash':
        return <Banknote className="h-4 w-4 text-green-500" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rent':
        return <Badge variant="default">Rent</Badge>
      case 'water':
        return <Badge variant="secondary">Water</Badge>
      default:
        return <Badge variant="outline">Other</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment History</h1>
          <p className="text-muted-foreground">
            View all your submitted payments and their status
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by month or transaction code..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Payments</CardTitle>
            <CardDescription>
              {filteredPayments.length} payment(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  {search ? 'Try a different search term' : 'No payments available yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-6 rounded-lg border border-secondary-700 bg-secondary-800/30 hover:bg-secondary-800/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {getMethodIcon(payment.method)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{payment.month}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {getTypeBadge(payment.type)}
                                {getStatusBadge(payment.status)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Submitted: {payment.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">KSh {payment.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {payment.method === 'mpesa' ? (
                              <>
                                <Smartphone className="h-4 w-4 text-blue-500" />
                                <span>Code: {payment.transactionCode}</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="h-4 w-4 text-green-500" />
                                <span>Caretaker: {payment.caretaker}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => alert(`Viewing payment: ${payment.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                        {payment.status === 'verified' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => alert(`Downloading receipt for: ${payment.id}`)}
                          >
                            <Download className="h-4 w-4" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Status Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Verified</h4>
                  <p className="text-sm text-muted-foreground">Payment confirmed by admin</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <h4 className="font-medium">Pending</h4>
                  <p className="text-sm text-muted-foreground">Awaiting admin verification</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium">Rejected</h4>
                  <p className="text-sm text-muted-foreground">Payment verification failed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
