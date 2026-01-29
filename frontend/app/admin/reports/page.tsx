"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Filter, Printer, FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'
import { api } from '@/lib/api/client'
import { useToast } from '@/lib/hooks/use-toast'

export default function ReportsPage() {
  const { fetchDashboardData, dashboardData, isLoading } = useAnalytics()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  })
  const [reportType, setReportType] = useState('financial')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [generatedReport, setGeneratedReport] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Get the toast function from the hook
  const { toast } = useToast()

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const filters = {
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0],
        type: reportType
      }

      const response = await api.post<any>('/analytics/report', filters)
      const data = response as any

      if (data.success && data.data) {
        setGeneratedReport(data.data)
        toast({
          title: 'Success',
          description: 'Report generated successfully',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to generate report',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportReport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0],
        type: reportType,
        format: exportFormat
      })

      const response = await api.get(`/analytics/export?${params}`, {
        responseType: 'blob'
      })

      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response)
        const a = document.createElement('a')
        a.href = url
        a.download = `montez-a-report-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'Success',
          description: 'Report exported successfully',
          variant: 'default'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export report',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export financial reports for Montez A Apartments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.summary?.totalRentPaid || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {dashboardData?.summary?.totalTenants || 0} tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(dashboardData?.summary?.totalRentDue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData?.summary?.pendingPayments || 0} pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.summary?.occupancyRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData?.unitStatus?.occupied || 0} / {dashboardData?.summary?.totalUnits || 0} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Rent Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                // Check if averageRent exists, otherwise calculate it
                (dashboardData?.summary as any)?.averageRent ||
                (dashboardData?.summary?.totalTenants && dashboardData.summary.totalTenants > 0
                  ? Math.round((dashboardData.summary.totalRentPaid || 0) / dashboardData.summary.totalTenants)
                  : 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per apartment monthly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    startDate: new Date(e.target.value)
                  })}
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    endDate: new Date(e.target.value)
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Quick Filters</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const now = new Date()
                    setDateRange({
                      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                      endDate: now
                    })
                  }}>
                    This Month
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const now = new Date()
                    setDateRange({
                      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                      endDate: new Date(now.getFullYear(), now.getMonth(), 0)
                    })
                  }}>
                    Last Month
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const now = new Date()
                    setDateRange({
                      startDate: new Date(now.getFullYear(), 0, 1),
                      endDate: now
                    })
                  }}>
                    Year to Date
                  </Button>
                </div>
              </div>

              <Button onClick={handleGenerateReport} className="w-full" disabled={isGenerating}>
                <BarChart3 className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Report...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Preview */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report for {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{formatCurrency(generatedReport.totalRevenue || 0)}</div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{generatedReport.totalTransactions || 0}</div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{generatedReport.paidTenants || 0}/{generatedReport.totalTenants || 0}</div>
                      <p className="text-sm text-muted-foreground">Paid Tenants</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Rent Collected</TableHead>
                          <TableHead>Rent Due</TableHead>
                          <TableHead>Collection Rate</TableHead>
                          <TableHead>Paid Tenants</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedReport.monthlyTrends?.map((trend: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{trend.month}</TableCell>
                            <TableCell>{formatCurrency(trend.rentCollected)}</TableCell>
                            <TableCell>{formatCurrency(trend.rentDue)}</TableCell>
                            <TableCell>{trend.collectionRate}%</TableCell>
                            <TableCell>{trend.paidTenants}/{trend.totalTenants}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Payment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenant</TableHead>
                          <TableHead>Apartment</TableHead>
                          <TableHead>Rent Due</TableHead>
                          <TableHead>Amount Paid</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Last Payment</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedReport.tenantDetails?.map((tenant: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{tenant.name}</TableCell>
                            <TableCell>{tenant.apartment}</TableCell>
                            <TableCell>{formatCurrency(tenant.rentDue)}</TableCell>
                            <TableCell>{formatCurrency(tenant.amountPaid)}</TableCell>
                            <TableCell className={tenant.balance > 0 ? "text-amber-600 font-bold" : "text-green-600"}>
                              {formatCurrency(tenant.balance)}
                            </TableCell>
                            <TableCell>{tenant.lastPayment || 'No payments'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                tenant.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                tenant.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {tenant.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chart visualization would appear here</p>
                      <p className="text-sm">(Requires charting library integration)</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Templates</CardTitle>
          <CardDescription>Pre-configured report templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => {
                setReportType('financial')
                const now = new Date()
                setDateRange({
                  startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                  endDate: now
                })
              }}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Monthly Financial</span>
              <span className="text-xs text-muted-foreground">This month's overview</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => {
                setReportType('occupancy')
                const now = new Date()
                setDateRange({
                  startDate: new Date(now.getFullYear(), 0, 1),
                  endDate: now
                })
              }}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Annual Occupancy</span>
              <span className="text-xs text-muted-foreground">Year-to-date occupancy</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => {
                setReportType('payments')
                const now = new Date()
                setDateRange({
                  startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
                  endDate: now
                })
              }}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Quarterly Payments</span>
              <span className="text-xs text-muted-foreground">Last 3 months payments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}