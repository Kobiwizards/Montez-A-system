"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Check, X, Filter, Download, RefreshCw, DollarSign } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { paymentApi } from '@/lib/api/payment'
import { formatDate } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching payments...')
      
      const response = await paymentApi.getAllPayments({ 
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      console.log('📊 Payments response:', {
        total: response.pagination?.total,
        count: response.data?.length
      })
      
      if (response.data && Array.isArray(response.data)) {
        setPayments(response.data)
      }
    } catch (error: any) {
      console.error('❌ Error fetching payments:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load payments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      await paymentApi.verifyPayment(id, { status: 'VERIFIED', adminNotes: 'Verified by admin' })
      toast({
        title: 'Success',
        description: 'Payment verified successfully',
      })
      fetchPayments()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await paymentApi.verifyPayment(id, { status: 'REJECTED', adminNotes: 'Rejected by admin' })
      toast({
        title: 'Success',
        description: 'Payment rejected',
      })
      fetchPayments()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payment',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'MPESA':
        return <Badge variant="outline" className="border-green-500 text-green-600">M-Pesa</Badge>
      case 'CASH':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Cash</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const filteredPayments = payments.filter(payment => 
    statusFilter === 'all' || payment.status === statusFilter
  )

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    verified: payments.filter(p => p.status === 'VERIFIED').length,
    rejected: payments.filter(p => p.status === 'REJECTED').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0)
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
                <DollarSign className="h-8 w-8" />
                Payments Management
              </h1>
              <p className="text-muted-foreground">
                View and verify tenant payments
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchPayments} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Badge className="bg-yellow-500 h-8 w-8 flex items-center justify-center">
                    !
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
                  </div>
                  <Badge className="bg-green-500 h-8 w-8 flex items-center justify-center">
                    ✓
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold">
                      KSh {stats.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2">Filter Payments</p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status ({payments.length})</SelectItem>
                      <SelectItem value="PENDING">Pending ({stats.pending})</SelectItem>
                      <SelectItem value="VERIFIED">Verified ({stats.verified})</SelectItem>
                      <SelectItem value="REJECTED">Rejected ({stats.rejected})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredPayments.length} of {payments.length} payments
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                Review and verify payment submissions from tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payments...</p>
                  </div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                  <p className="text-muted-foreground">
                    {statusFilter !== 'all' 
                      ? `No ${statusFilter.toLowerCase()} payments` 
                      : 'No payment records yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.tenant?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{payment.month}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.tenant?.apartment || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{payment.type?.toLowerCase()}</TableCell>
                          <TableCell>{getMethodBadge(payment.method)}</TableCell>
                          <TableCell className="font-medium">
                            KSh {payment.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatDate(payment.createdAt, 'short')}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {payment.status === 'PENDING' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleVerify(payment.id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="Verify Payment"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleReject(payment.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Reject Payment"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}