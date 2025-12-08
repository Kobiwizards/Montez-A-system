"use client"

import { useState } from 'react'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Download,
  FileText,
  Calendar,
  CreditCard,
  Filter,
  Printer,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Receipt {
  id: string
  receiptNumber: string
  month: string
  amount: number
  type: 'rent' | 'water' | 'other'
  status: 'verified' | 'pending' | 'rejected'
  downloadCount: number
  generatedAt: string
  paymentMethod: 'mpesa' | 'cash'
}

export default function ReceiptsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'rent' | 'water'>('all')

  // Mock receipts data
  const receipts: Receipt[] = [
    {
      id: '1',
      receiptNumber: 'MTA-2024-01-001',
      month: 'January 2024',
      amount: 15000,
      type: 'rent',
      status: 'verified',
      downloadCount: 2,
      generatedAt: '2024-01-05',
      paymentMethod: 'mpesa'
    },
    {
      id: '2',
      receiptNumber: 'MTA-2023-12-002',
      month: 'December 2023',
      amount: 15000,
      type: 'rent',
      status: 'verified',
      downloadCount: 1,
      generatedAt: '2023-12-05',
      paymentMethod: 'cash'
    },
    {
      id: '3',
      receiptNumber: 'MTA-2023-11-003',
      month: 'November 2023',
      amount: 15000,
      type: 'rent',
      status: 'verified',
      downloadCount: 3,
      generatedAt: '2023-11-05',
      paymentMethod: 'mpesa'
    },
    {
      id: '4',
      receiptNumber: 'MTA-2024-01-W001',
      month: 'January 2024',
      amount: 750,
      type: 'water',
      status: 'pending',
      downloadCount: 0,
      generatedAt: '2024-01-10',
      paymentMethod: 'mpesa'
    },
    {
      id: '5',
      receiptNumber: 'MTA-2023-12-W002',
      month: 'December 2023',
      amount: 600,
      type: 'water',
      status: 'verified',
      downloadCount: 1,
      generatedAt: '2023-12-10',
      paymentMethod: 'cash'
    }
  ]

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      receipt.month.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = filter === 'all' || receipt.type === filter
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>
      case 'pending':
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">M-Pesa</Badge>
      case 'cash':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Cash</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const handleDownload = (receipt: Receipt) => {
    // Simulate download
    alert(`Downloading receipt: ${receipt.receiptNumber}`)
  }

  const handleView = (receipt: Receipt) => {
    // Simulate view
    alert(`Viewing receipt: ${receipt.receiptNumber}`)
  }

  const handlePrint = (receipt: Receipt) => {
    // Simulate print
    alert(`Printing receipt: ${receipt.receiptNumber}`)
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Receipts</h1>
          <p className="text-muted-foreground">
            View and download your payment receipts
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Receipts</p>
                  <p className="text-2xl font-bold">{receipts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{receipts.filter(r => r.status === 'verified').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">KSh {receipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">{receipts.reduce((sum, r) => sum + r.downloadCount, 0)}</p>
                </div>
                <Download className="h-8 w-8 text-purple-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search receipts by number or month..."
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
                    <option value="all">All Types</option>
                    <option value="rent">Rent Only</option>
                    <option value="water">Water Only</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipts List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Receipts</CardTitle>
            <CardDescription>
              {filteredReceipts.length} receipt(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No receipts found</h3>
                <p className="text-muted-foreground">
                  {search ? 'Try a different search term' : 'No receipts available yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-lg border border-secondary-700 bg-secondary-800/30 hover:bg-secondary-800/50 transition-colors"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start md:items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h3 className="font-semibold">{receipt.receiptNumber}</h3>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(receipt.status)}
                              {getTypeBadge(receipt.type)}
                              {getMethodBadge(receipt.paymentMethod)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{receipt.month}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">KSh {receipt.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4 text-muted-foreground" />
                              <span>Downloaded {receipt.downloadCount} time(s)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleView(receipt)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownload(receipt)}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handlePrint(receipt)}
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Receipts are generated automatically after payment verification</li>
                <li>• Pending receipts will be available after admin verification</li>
                <li>• Keep receipts for your records and tax purposes</li>
                <li>• Contact admin if you notice any discrepancies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Receipt Number: MTA-[Year]-[Month]-[Sequence]</li>
                <li>• Water receipts: MTA-[Year]-[Month]-W[Sequence]</li>
                <li>• All receipts include tenant details and payment information</li>
                <li>• Receipts are valid for 7 years for accounting purposes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
