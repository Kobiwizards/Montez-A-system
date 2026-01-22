"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Droplets, Plus, Download, RefreshCw, CheckCircle, XCircle, Filter, Calendar } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { formatDate, formatCurrency } from '@/lib/utils'

// Interface matching your seed.ts water readings
interface WaterReading {
  id: string
  tenantId: string
  previousReading: number
  currentReading: number
  units: number
  rate: number
  amount: number
  month: string
  year: number
  paid: boolean
  createdAt: string
  updatedAt?: string
  tenant?: {
    id: string
    name: string
    apartment: string
    unitType: string
  }
  paymentId?: string
}

// Interface for tenant data matching your seed
interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rentAmount: number
  balance: number
  status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT' | 'EVICTED' | 'FORMER'
  moveInDate: string
}

export default function AdminWaterBillsPage() {
  const [readings, setReadings] = useState<WaterReading[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching water data...')
      
      // In a real app, you would fetch from API
      // For now, we'll simulate API calls based on your seed data
      
      // Simulate tenants data (from your seed.ts)
      const mockTenants: Tenant[] = [
        {
          id: '1', name: 'John Kamau', email: 'john.kamau@monteza.com', phone: '254712345601',
          apartment: '1A1', unitType: 'TWO_BEDROOM', rentAmount: 18000, balance: 0,
          status: 'CURRENT', moveInDate: '2023-05-15'
        },
        {
          id: '2', name: 'Mary Wanjiku', email: 'mary.wanjiku@monteza.com', phone: '254712345602',
          apartment: '1A2', unitType: 'TWO_BEDROOM', rentAmount: 18000, balance: 7500,
          status: 'CURRENT', moveInDate: '2023-06-01'
        },
        {
          id: '3', name: 'Peter Kariuki', email: 'peter.kariuki@monteza.com', phone: '254712345603',
          apartment: '1B1', unitType: 'ONE_BEDROOM', rentAmount: 15000, balance: 0,
          status: 'CURRENT', moveInDate: '2023-07-10'
        },
        {
          id: '4', name: 'Jane Muthoni', email: 'jane.muthoni@monteza.com', phone: '254712345604',
          apartment: '1B2', unitType: 'ONE_BEDROOM', rentAmount: 15000, balance: 15000,
          status: 'OVERDUE', moveInDate: '2023-04-20'
        },
        {
          id: '5', name: 'David Omondi', email: 'david.omondi@monteza.com', phone: '254712345605',
          apartment: '2A1', unitType: 'TWO_BEDROOM', rentAmount: 18000, balance: 0,
          status: 'CURRENT', moveInDate: '2023-08-15'
        }
      ]

      // Simulate water readings data (from your seed.ts structure)
      const mockWaterReadings: WaterReading[] = [
        {
          id: '1',
          tenantId: '1',
          previousReading: 100,
          currentReading: 115,
          units: 15,
          rate: 150,
          amount: 2250,
          month: '2024-01',
          year: 2024,
          paid: true,
          createdAt: '2024-01-15T10:30:00Z',
          tenant: { id: '1', name: 'John Kamau', apartment: '1A1', unitType: 'TWO_BEDROOM' }
        },
        {
          id: '2',
          tenantId: '2',
          previousReading: 85,
          currentReading: 98,
          units: 13,
          rate: 150,
          amount: 1950,
          month: '2024-01',
          year: 2024,
          paid: false,
          createdAt: '2024-01-16T11:15:00Z',
          tenant: { id: '2', name: 'Mary Wanjiku', apartment: '1A2', unitType: 'TWO_BEDROOM' }
        },
        {
          id: '3',
          tenantId: '3',
          previousReading: 120,
          currentReading: 130,
          units: 10,
          rate: 150,
          amount: 1500,
          month: '2024-01',
          year: 2024,
          paid: true,
          createdAt: '2024-01-14T09:45:00Z',
          tenant: { id: '3', name: 'Peter Kariuki', apartment: '1B1', unitType: 'ONE_BEDROOM' }
        },
        {
          id: '4',
          tenantId: '4',
          previousReading: 95,
          currentReading: 105,
          units: 10,
          rate: 150,
          amount: 1500,
          month: '2024-01',
          year: 2024,
          paid: false,
          createdAt: '2024-01-17T14:20:00Z',
          tenant: { id: '4', name: 'Jane Muthoni', apartment: '1B2', unitType: 'ONE_BEDROOM' }
        },
        {
          id: '5',
          tenantId: '5',
          previousReading: 110,
          currentReading: 125,
          units: 15,
          rate: 150,
          amount: 2250,
          month: '2024-01',
          year: 2024,
          paid: true,
          createdAt: '2024-01-18T16:00:00Z',
          tenant: { id: '5', name: 'David Omondi', apartment: '2A1', unitType: 'TWO_BEDROOM' }
        },
        // Add more months based on your seed data
        {
          id: '6',
          tenantId: '1',
          previousReading: 115,
          currentReading: 135,
          units: 20,
          rate: 150,
          amount: 3000,
          month: '2024-02',
          year: 2024,
          paid: true,
          createdAt: '2024-02-15T10:30:00Z',
          tenant: { id: '1', name: 'John Kamau', apartment: '1A1', unitType: 'TWO_BEDROOM' }
        },
        {
          id: '7',
          tenantId: '2',
          previousReading: 98,
          currentReading: 110,
          units: 12,
          rate: 150,
          amount: 1800,
          month: '2024-02',
          year: 2024,
          paid: false,
          createdAt: '2024-02-16T11:15:00Z',
          tenant: { id: '2', name: 'Mary Wanjiku', apartment: '1A2', unitType: 'TWO_BEDROOM' }
        }
      ]

      // Filter readings by selected month
      const filteredReadings = mockWaterReadings.filter(
        reading => reading.month === selectedMonth
      )

      setTenants(mockTenants)
      setReadings(filteredReadings)
      
      console.log(`✅ Loaded ${filteredReadings.length} water readings for ${selectedMonth}`)
      
    } catch (error: any) {
      console.error('❌ Error fetching water data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load water readings data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalReadings: readings.length,
    totalUnits: readings.reduce((sum, r) => sum + r.units, 0),
    totalAmount: readings.reduce((sum, r) => sum + r.amount, 0),
    paidAmount: readings.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0),
    unpaidAmount: readings.filter(r => !r.paid).reduce((sum, r) => sum + r.amount, 0),
    paidCount: readings.filter(r => r.paid).length,
    unpaidCount: readings.filter(r => !r.paid).length
  }

  // Generate month options based on your seed data
  const monthOptions = [
    { value: '2024-01', label: 'January 2024' },
    { value: '2024-02', label: 'February 2024' },
    { value: '2024-03', label: 'March 2024' },
    { value: '2024-04', label: 'April 2024' },
  ]

  const handleMarkAsPaid = async (readingId: string) => {
    try {
      // In real app: await waterApi.markAsPaid(readingId, paymentId)
      setReadings(readings.map(reading => 
        reading.id === readingId ? { ...reading, paid: true } : reading
      ))
      
      toast({
        title: 'Success',
        description: 'Water reading marked as paid',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      })
    }
  }

  const handleExportData = () => {
    // Implement export functionality
    toast({
      title: 'Export Started',
      description: 'Preparing water bills data for download...',
    })
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
                <Droplets className="h-8 w-8 text-blue-500" />
                Water Bills Management
              </h1>
              <p className="text-muted-foreground">
                Manage water readings and bill calculations for Montez A Apartments
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filter and Month Selector */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Select Month:</span>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    {monthOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Showing {readings.length} readings for {selectedMonth}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units Consumed</p>
                    <p className="text-3xl font-bold">{stats.totalUnits} units</p>
                  </div>
                  <Droplets className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.totalReadings} readings
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                  </div>
                  <Badge className={`h-8 w-8 flex items-center justify-center ${
                    stats.totalAmount > 0 ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    KSh
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Rate: KSh 150 per unit
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(stats.paidAmount)}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.paidCount} paid bills
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unpaid Amount</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(stats.unpaidAmount)}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {stats.unpaidCount} unpaid bills
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Water Readings Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Water Readings & Bills - {selectedMonth}</CardTitle>
                  <CardDescription>
                    Monthly water consumption and billing records (Rate: KSh 150 per unit)
              </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Reading
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading water readings...</p>
                  </div>
                </div>
              ) : readings.length === 0 ? (
                <div className="text-center py-12">
                  <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No water readings for {selectedMonth}</h3>
                  <p className="text-muted-foreground mb-6">
                    No water meter readings recorded for this month
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Reading
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Unit Type</TableHead>
                        <TableHead>Previous</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readings.map((reading) => (
                        <TableRow key={reading.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{reading.tenant?.name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(reading.createdAt, 'short')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {reading.tenant?.apartment || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reading.tenant?.unitType === 'TWO_BEDROOM' ? '2 Bedroom' : '1 Bedroom'}
                          </TableCell>
                          <TableCell className="font-mono">{reading.previousReading}</TableCell>
                          <TableCell className="font-mono">{reading.currentReading}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {reading.units} units
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">KSh {reading.rate}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(reading.amount)}
                          </TableCell>
                          <TableCell>
                            {reading.paid ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                <XCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!reading.paid && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMarkAsPaid(reading.id)}
                                  className="h-8 px-3 text-xs"
                                >
                                  Mark Paid
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-8 px-3">
                                Edit
                              </Button>
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

          {/* Summary Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Billed Amount:</span>
                    <span className="font-semibold">{formatCurrency(stats.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid Amount:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unpaid Amount:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(stats.unpaidAmount)}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Payment Rate:</span>
                      <span className="font-semibold">
                        {stats.totalAmount > 0 
                          ? `${((stats.paidAmount / stats.totalAmount) * 100).toFixed(1)}%` 
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Water Bills PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Add Readings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Droplets className="h-4 w-4 mr-2" />
                  Send Payment Reminders
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}