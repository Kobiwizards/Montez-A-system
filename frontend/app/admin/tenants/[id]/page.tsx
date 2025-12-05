"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Mail, Phone, Calendar, AlertCircle, CreditCard, Receipt, Droplets, Wrench } from 'lucide-react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/lib/hooks/use-toast'
import Link from 'next/link'

interface TenantDetails {
  id: string
  name: string
  email: string
  phone: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rentAmount: number
  waterRate: number
  balance: number
  status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT'
  moveInDate: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopyUrl?: string
  contractUrl?: string
  statistics: {
    totalPaid: number
    pendingPayments: number
    totalWaterDue: number
    paymentCount: number
    receiptCount: number
    maintenanceCount: number
  }
  recentPayments: any[]
  recentReceipts: any[]
  maintenanceRequests: any[]
  waterReadings: any[]
}

export default function TenantDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenantDetails()
  }, [id])

  const fetchTenantDetails = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockTenant: TenantDetails = {
        id: id as string,
        name: 'John Kamau',
        email: 'john.kamau@monteza.com',
        phone: '254712345678',
        apartment: '1A1',
        unitType: 'TWO_BEDROOM',
        rentAmount: 18000,
        waterRate: 150,
        balance: 0,
        status: 'CURRENT',
        moveInDate: '2023-01-15',
        leaseEndDate: '2024-12-31',
        emergencyContact: '254723456789',
        notes: 'Responsible tenant, always pays on time',
        statistics: {
          totalPaid: 54000,
          pendingPayments: 0,
          totalWaterDue: 750,
          paymentCount: 3,
          receiptCount: 3,
          maintenanceCount: 1,
        },
        recentPayments: [
          { id: '1', month: '2024-01', amount: 18000, status: 'VERIFIED', type: 'RENT' },
          { id: '2', month: '2023-12', amount: 18000, status: 'VERIFIED', type: 'RENT' },
          { id: '3', month: '2023-11', amount: 18000, status: 'VERIFIED', type: 'RENT' },
        ],
        recentReceipts: [
          { id: '1', receiptNumber: 'MTA-202401-001', amount: 18000, month: '2024-01' },
          { id: '2', receiptNumber: 'MTA-202312-001', amount: 18000, month: '2023-12' },
        ],
        maintenanceRequests: [
          { id: '1', title: 'Leaking faucet', status: 'COMPLETED', priority: 'MEDIUM' },
        ],
        waterReadings: [
          { month: '2024-01', units: 5, amount: 750, paid: true },
          { month: '2023-12', units: 4, amount: 600, paid: true },
        ],
      }
      setTenant(mockTenant)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tenant details',
        variant: 'destructive',
      })
      router.push('/admin/tenants')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: TenantDetails['status']) => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="success">Current</Badge>
      case 'OVERDUE':
        return <Badge variant="warning">Overdue</Badge>
      case 'DELINQUENT':
        return <Badge variant="error">Delinquent</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUnitTypeLabel = (type: TenantDetails['unitType']) => {
    return type === 'ONE_BEDROOM' ? 'One Bedroom' : 'Two Bedroom'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tenant details...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tenant Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The tenant you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/admin/tenants')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/tenants')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tenants
            </Button>
          </div>

          {/* Tenant Header */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">{tenant.name}</h1>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-base px-3 py-1">
                            {tenant.apartment}
                          </Badge>
                          {getStatusBadge(tenant.status)}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/admin/tenants/${tenant.id}/edit`}>
                          <Button variant="outline">Edit Tenant</Button>
                        </Link>
                        <Button>Send Message</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{tenant.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{getUnitTypeLabel(tenant.unitType)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>KSh {tenant.rentAmount.toLocaleString()}/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="lg:w-80">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                    <span className="font-bold text-success">
                      KSh {tenant.statistics.totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className={`font-bold ${tenant.balance > 0 ? 'text-error' : 'text-success'}`}>
                      KSh {tenant.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Water Due</span>
                    <span className="font-bold text-warning">
                      KSh {tenant.statistics.totalWaterDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payments</span>
                    <span>{tenant.statistics.paymentCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="water">Water</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tenant Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tenant Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Move-in Date</p>
                        <p className="font-medium">
                          {new Date(tenant.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lease End</p>
                        <p className="font-medium">
                          {tenant.leaseEndDate 
                            ? new Date(tenant.leaseEndDate).toLocaleDateString()
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-medium">{tenant.emergencyContact || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Water Rate</p>
                        <p className="font-medium">KSh {tenant.waterRate}/unit</p>
                      </div>
                    </div>
                    
                    {tenant.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Notes</p>
                        <p className="text-sm bg-secondary-800/50 p-3 rounded-lg">
                          {tenant.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tenant.recentPayments.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-800/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="font-medium">{payment.month} Rent</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString()}
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
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      All payment transactions for {tenant.name}
                    </CardDescription>
                  </div>
                  <Button>View All Payments</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenant.recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                          <TableCell>{payment.month}</TableCell>
                          <TableCell>{payment.type}</TableCell>
                          <TableCell className="font-medium">
                            KSh {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>M-Pesa</TableCell>
                          <TableCell>
                            <Badge variant="success">{payment.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Water Tab */}
            <TabsContent value="water">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Water Consumption</CardTitle>
                    <CardDescription>
                      Water readings and bills for {tenant.apartment}
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Droplets className="h-4 w-4" />
                    Add Reading
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Previous Reading</TableHead>
                        <TableHead>Current Reading</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenant.waterReadings.map((reading, index) => (
                        <TableRow key={index}>
                          <TableCell>{reading.month}</TableCell>
                          <TableCell>{(index * 100).toLocaleString()}</TableCell>
                          <TableCell>{(index * 100 + reading.units).toLocaleString()}</TableCell>
                          <TableCell>{reading.units} units</TableCell>
                          <TableCell className="font-medium">
                            KSh {reading.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={reading.paid ? "success" : "warning"}>
                              {reading.paid ? 'Paid' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Maintenance Requests</CardTitle>
                    <CardDescription>
                      All maintenance requests from {tenant.name}
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Wrench className="h-4 w-4" />
                    New Request
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenant.maintenanceRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>
                            <Badge variant="warning">{request.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">{request.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}