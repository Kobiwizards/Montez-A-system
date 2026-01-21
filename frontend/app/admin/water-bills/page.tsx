"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Droplets, Plus, Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { waterApi } from '@/lib/api/water' // You'll need to create this API file

// Create this file: lib/api/water.ts
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
  tenant?: {
    id: string
    name: string
    apartment: string
  }
}

// Temporary mock data - replace with actual API call
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
    createdAt: '2024-01-15',
    tenant: { id: '1', name: 'John Kamau', apartment: '1A1' }
  },
  // Add more mock data...
]

export default function AdminWaterBillsPage() {
  const [readings, setReadings] = useState<WaterReading[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchWaterReadings()
  }, [])

  const fetchWaterReadings = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching water readings...')
      
      // TODO: Replace with actual API call
      // const response = await waterApi.getAllReadings()
      // setReadings(response.data)
      
      // For now, use mock data
      setTimeout(() => {
        setReadings(mockWaterReadings)
        setLoading(false)
      }, 1000)
      
    } catch (error: any) {
      console.error('❌ Error fetching water readings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load water readings',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const stats = {
    totalReadings: readings.length,
    totalUnits: readings.reduce((sum, r) => sum + r.units, 0),
    totalAmount: readings.reduce((sum, r) => sum + r.amount, 0),
    paidAmount: readings.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0),
    unpaidAmount: readings.filter(r => !r.paid).reduce((sum, r) => sum + r.amount, 0)
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
                <Droplets className="h-8 w-8" />
                Water Bills Management
              </h1>
              <p className="text-muted-foreground">
                Manage water readings and bill calculations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchWaterReadings} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reading
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Readings</p>
                    <p className="text-3xl font-bold">{stats.totalReadings}</p>
                  </div>
                  <Droplets className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="text-3xl font-bold">{stats.totalUnits}</p>
                  </div>
                  <Badge className="bg-blue-500 h-8 w-8 flex items-center justify-center">
                    {stats.totalUnits}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold">KSh {stats.totalAmount.toLocaleString()}</p>
                  </div>
                  <Badge className="bg-green-500 h-8 w-8 flex items-center justify-center">
                    $
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unpaid</p>
                    <p className="text-3xl font-bold text-red-600">
                      KSh {stats.unpaidAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-red-500 h-8 w-8 flex items-center justify-center">
                    !
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Water Readings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Water Readings & Bills</CardTitle>
              <CardDescription>
                Monthly water consumption and billing records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading water readings...</p>
                  </div>
                </div>
              ) : readings.length === 0 ? (
                <div className="text-center py-12">
                  <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No water readings</h3>
                  <p className="text-muted-foreground mb-6">
                    No water meter readings recorded yet
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
                        <TableHead>Month</TableHead>
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
                            <p className="font-medium">{reading.tenant?.name || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{reading.tenant?.apartment || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>{reading.month}</TableCell>
                          <TableCell>{reading.previousReading}</TableCell>
                          <TableCell>{reading.currentReading}</TableCell>
                          <TableCell>{reading.units}</TableCell>
                          <TableCell>KSh {reading.rate}</TableCell>
                          <TableCell className="font-medium">
                            KSh {reading.amount.toLocaleString()}
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
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
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