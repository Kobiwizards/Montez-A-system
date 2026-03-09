"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'  // ← ADD THIS IMPORT
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, FileText, BarChart3, TrendingUp, Calendar, Filter, Printer, Eye } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { tenantApi } from '@/lib/api/tenant'
import { paymentApi } from '@/lib/api/payment'

export default function AdminReportsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState('financial')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
    paidTenants: 0,
    pendingPayments: 0,
    occupancyRate: 0
  })

  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardStats()
    }
  }, [isAuthenticated, user])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch tenants
      const tenantsResponse = await tenantApi.getAllTenants({ limit: 100 })
      const tenants = tenantsResponse.data || []
      
      // Fetch payments
      const paymentsResponse = await paymentApi.getAllPayments({ limit: 100 })
      const payments = paymentsResponse.data || []
      
      // Calculate stats
      const totalRevenue = payments
        .filter((p: any) => p.status === 'VERIFIED')
        .reduce((sum: number, p: any) => sum + p.amount, 0)
      
      const totalOutstanding = tenants.reduce((sum: number, t: any) => sum + t.balance, 0)
      const paidTenants = tenants.filter((t: any) => t.balance === 0).length
      const pendingPayments = payments.filter((p: any) => p.status === 'PENDING').length
      
      setStats({
        totalTenants: tenants.length,
        totalPayments: payments.length,
        totalRevenue,
        totalOutstanding,
        paidTenants,
        pendingPayments,
        occupancyRate: 100 // Assuming full occupancy
      })
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock report data based on report type
      const mockReportData = {
        financial: {
          title: 'Financial Summary Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalRevenue: 245000,
            totalPayments: 42,
            averagePayment: 5833,
            outstandingBalance: 87500,
            collectionRate: 73.7
          },
          breakdown: [
            { month: 'January', revenue: 85000, payments: 15, outstanding: 25000 },
            { month: 'February', revenue: 82000, payments: 14, outstanding: 28000 },
            { month: 'March', revenue: 78000, payments: 13, outstanding: 34500 }
          ]
        },
        occupancy: {
          title: 'Occupancy Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalUnits: 24,
            occupiedUnits: 22,
            vacancyRate: 8.3,
            averageRent: 16500,
            monthlyRevenue: 363000
          },
          breakdown: [
            { unitType: 'One Bedroom', total: 12, occupied: 11, rate: 91.7, avgRent: 15000 },
            { unitType: 'Two Bedroom', total: 12, occupied: 11, rate: 91.7, avgRent: 18000 }
          ]
        },
        payments: {
          title: 'Payment Details Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalPayments: 42,
            verifiedPayments: 35,
            pendingPayments: 7,
            rejectedPayments: 0,
            totalAmount: 245000
          },
          breakdown: [
            { method: 'M-Pesa', count: 38, amount: 221000 },
            { method: 'Cash', count: 4, amount: 24000 }
          ]
        },
        tenant: {
          title: 'Tenant Statements Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalTenants: 22,
            paidInFull: 15,
            partialPayment: 4,
            noPayment: 3,
            totalOutstanding: 87500
          },
          breakdown: [
            { name: 'John Kamau', apartment: '1A1', paid: 18000, balance: 0, status: 'PAID' },
            { name: 'Mary Wanjiku', apartment: '1A2', paid: 10500, balance: 7500, status: 'PARTIAL' },
            { name: 'Peter Kariuki', apartment: '1B1', paid: 15000, balance: 0, status: 'PAID' },
            { name: 'Jane Muthoni', apartment: '1B2', paid: 0, balance: 15000, status: 'UNPAID' }
          ]
        },
        water: {
          title: 'Water Billing Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalReadings: 22,
            totalUnits: 330,
            totalBilled: 49500,
            totalPaid: 38250,
            unpaidAmount: 11250,
            paymentRate: 77.3
          },
          breakdown: [
            { month: 'January', readings: 22, units: 110, amount: 16500, paid: 14250 },
            { month: 'February', readings: 22, units: 108, amount: 16200, paid: 13200 },
            { month: 'March', readings: 22, units: 112, amount: 16800, paid: 10800 }
          ]
        }
      }

      setReportData(mockReportData[reportType as keyof typeof mockReportData] || mockReportData.financial)
      
      toast({
        title: 'Success',
        description: 'Report generated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleExportReport = () => {
    toast({
      title: 'Export Started',
      description: `Preparing ${exportFormat.toUpperCase()} report for download...`,
    })
    // In a real app, this would trigger a file download
  }

  const handlePrintReport = () => {
    window.print()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getQuickDateRange = (range: string) => {
    const today = new Date()
    let startDate = new Date()
    
    switch (range) {
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'last-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        today.setDate(0) // Last day of previous month
        break
      case 'this-quarter':
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), quarter * 3, 1)
        break
      case 'this-year':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
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
                <FileText className="h-8 w-8" />
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground">
                Generate and export detailed reports for Montez A Apartments
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchDashboardStats} disabled={loading}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
              <Button onClick={handleGenerateReport} disabled={generating}>
                <FileText className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                    <p className="text-3xl font-bold">{stats.totalTenants}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.paidTenants} paid in full
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  From {stats.totalPayments} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(stats.totalOutstanding)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.pendingPayments} pending payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.occupancyRate}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.totalTenants} of 24 units occupied
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Report Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Customize your report parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                      <SelectItem value="occupancy">Occupancy Report</SelectItem>
                      <SelectItem value="payments">Payment Details</SelectItem>
                      <SelectItem value="tenant">Tenant Statements</SelectItem>
                      <SelectItem value="water">Water Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => getQuickDateRange('this-month')}>
                  This Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => getQuickDateRange('last-month')}>
                  Last Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => getQuickDateRange('this-quarter')}>
                  This Quarter
                </Button>
                <Button variant="outline" size="sm" onClick={() => getQuickDateRange('this-year')}>
                  This Year
                </Button>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={handlePrintReport}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleGenerateReport} disabled={generating}>
                  <FileText className="h-4 w-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          {reportData && (
            <Card className="print:shadow-none">
              <CardHeader className="print:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{reportData.title}</CardTitle>
                    <CardDescription>Period: {reportData.period}</CardDescription>
                  </div>
                  <Badge variant="outline" className="print:hidden">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview Mode
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="print:hidden">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reportType === 'financial' && (
                        <>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Total Revenue</p>
                              <p className="text-2xl font-bold">{formatCurrency(reportData.summary.totalRevenue)}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Total Payments</p>
                              <p className="text-2xl font-bold">{reportData.summary.totalPayments}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Collection Rate</p>
                              <p className="text-2xl font-bold">{reportData.summary.collectionRate}%</p>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {reportType === 'occupancy' && (
                        <>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Occupied Units</p>
                              <p className="text-2xl font-bold">{reportData.summary.occupiedUnits}/{reportData.summary.totalUnits}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Vacancy Rate</p>
                              <p className="text-2xl font-bold">{reportData.summary.vacancyRate}%</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Average Rent</p>
                              <p className="text-2xl font-bold">{formatCurrency(reportData.summary.averageRent)}</p>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {reportType === 'payments' && (
                        <>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Verified Payments</p>
                              <p className="text-2xl font-bold">{reportData.summary.verifiedPayments}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Pending Payments</p>
                              <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pendingPayments}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-2xl font-bold">{formatCurrency(reportData.summary.totalAmount)}</p>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>

                    {/* Breakdown Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {reportType === 'financial' && (
                                <>
                                  <TableHead>Month</TableHead>
                                  <TableHead>Revenue</TableHead>
                                  <TableHead>Payments</TableHead>
                                  <TableHead>Outstanding</TableHead>
                                </>
                              )}
                              {reportType === 'occupancy' && (
                                <>
                                  <TableHead>Unit Type</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Occupied</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead>Avg. Rent</TableHead>
                                </>
                              )}
                              {reportType === 'payments' && (
                                <>
                                  <TableHead>Payment Method</TableHead>
                                  <TableHead>Count</TableHead>
                                  <TableHead>Amount</TableHead>
                                </>
                              )}
                              {reportType === 'tenant' && (
                                <>
                                  <TableHead>Tenant</TableHead>
                                  <TableHead>Apartment</TableHead>
                                  <TableHead>Paid</TableHead>
                                  <TableHead>Balance</TableHead>
                                  <TableHead>Status</TableHead>
                                </>
                              )}
                              {reportType === 'water' && (
                                <>
                                  <TableHead>Month</TableHead>
                                  <TableHead>Readings</TableHead>
                                  <TableHead>Units</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Paid</TableHead>
                                </>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.breakdown.map((item: any, index: number) => (
                              <TableRow key={index}>
                                {reportType === 'financial' && (
                                  <>
                                    <TableCell>{item.month}</TableCell>
                                    <TableCell>{formatCurrency(item.revenue)}</TableCell>
                                    <TableCell>{item.payments}</TableCell>
                                    <TableCell className="text-red-600">{formatCurrency(item.outstanding)}</TableCell>
                                  </>
                                )}
                                {reportType === 'occupancy' && (
                                  <>
                                    <TableCell>{item.unitType}</TableCell>
                                    <TableCell>{item.total}</TableCell>
                                    <TableCell>{item.occupied}</TableCell>
                                    <TableCell>{item.rate}%</TableCell>
                                    <TableCell>{formatCurrency(item.avgRent)}</TableCell>
                                  </>
                                )}
                                {reportType === 'payments' && (
                                  <>
                                    <TableCell>{item.method}</TableCell>
                                    <TableCell>{item.count}</TableCell>
                                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                                  </>
                                )}
                                {reportType === 'tenant' && (
                                  <>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.apartment}</TableCell>
                                    <TableCell>{formatCurrency(item.paid)}</TableCell>
                                    <TableCell className={item.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                                      {formatCurrency(item.balance)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={
                                        item.status === 'PAID' ? 'default' :
                                        item.status === 'PARTIAL' ? 'secondary' : 'destructive'
                                      }>
                                        {item.status}
                                      </Badge>
                                    </TableCell>
                                  </>
                                )}
                                {reportType === 'water' && (
                                  <>
                                    <TableCell>{item.month}</TableCell>
                                    <TableCell>{item.readings}</TableCell>
                                    <TableCell>{item.units}</TableCell>
                                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                                    <TableCell>{formatCurrency(item.paid)}</TableCell>
                                  </>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground py-12">
                          Detailed view with transaction-level data would appear here.
                          <br />
                          This section would include all individual records within the selected period.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="charts">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="h-64 flex items-center justify-center border rounded-lg bg-gray-50">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">Chart visualization would appear here</p>
                            <p className="text-sm text-muted-foreground">
                              (Requires charting library integration)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Report Templates */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Financial
                </CardTitle>
                <CardDescription>
                  Revenue, payments, and outstanding balances for the current month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setReportType('financial')
                    getQuickDateRange('this-month')
                  }}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Occupancy Report
                </CardTitle>
                <CardDescription>
                  Unit occupancy rates and rental income by unit type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setReportType('occupancy')
                    getQuickDateRange('this-month')
                  }}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quarterly Summary
                </CardTitle>
                <CardDescription>
                  Comprehensive quarterly financial and operational overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setReportType('financial')
                    getQuickDateRange('this-quarter')
                  }}
                >
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}