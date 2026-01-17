"use client"

import { useState, useEffect } from 'react'
import { Users, Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, UserPlus, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/shared/auth-provider'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rentAmount: number
  balance: number
  status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT'
  moveInDate: string
  emergencyContact: string
}

export default function AdminTenantsPage() {
  const { user } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - replace with API call
  useEffect(() => {
    // TODO: Replace with actual API call
    const mockTenants: Tenant[] = [
      {
        id: '1',
        name: 'John Kamau',
        email: 'john.kamau@monteza.com',
        phone: '254712345601',
        apartment: '1A1',
        unitType: 'TWO_BEDROOM',
        rentAmount: 18000,
        balance: 0,
        status: 'CURRENT',
        moveInDate: '2023-01-15',
        emergencyContact: '254722345601'
      },
      {
        id: '2',
        name: 'Mary Wanjiku',
        email: 'mary.wanjiku@monteza.com',
        phone: '254712345602',
        apartment: '1A2',
        unitType: 'TWO_BEDROOM',
        rentAmount: 18000,
        balance: 7500,
        status: 'CURRENT',
        moveInDate: '2023-02-20',
        emergencyContact: '254722345602'
      },
      {
        id: '3',
        name: 'Peter Kariuki',
        email: 'peter.kariuki@monteza.com',
        phone: '254712345603',
        apartment: '1B1',
        unitType: 'ONE_BEDROOM',
        rentAmount: 15000,
        balance: 0,
        status: 'CURRENT',
        moveInDate: '2023-03-10',
        emergencyContact: '254722345603'
      },
      {
        id: '4',
        name: 'Jane Muthoni',
        email: 'jane.muthoni@monteza.com',
        phone: '254712345604',
        apartment: '1B2',
        unitType: 'ONE_BEDROOM',
        rentAmount: 15000,
        balance: 15000,
        status: 'OVERDUE',
        moveInDate: '2023-01-05',
        emergencyContact: '254722345604'
      },
      {
        id: '5',
        name: 'David Omondi',
        email: 'david.omondi@monteza.com',
        phone: '254712345605',
        apartment: '2A1',
        unitType: 'TWO_BEDROOM',
        rentAmount: 18000,
        balance: 0,
        status: 'CURRENT',
        moveInDate: '2023-04-15',
        emergencyContact: '254722345605'
      }
    ]
    
    setTimeout(() => {
      setTenants(mockTenants)
      setIsLoading(false)
    }, 500)
  }, [])

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tenants.length,
    current: tenants.filter(t => t.status === 'CURRENT').length,
    overdue: tenants.filter(t => t.status === 'OVERDUE').length,
    delinquent: tenants.filter(t => t.status === 'DELINQUENT').length,
    totalBalance: tenants.reduce((sum, t) => sum + t.balance, 0),
    totalRent: tenants.reduce((sum, t) => sum + t.rentAmount, 0)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Current</Badge>
      case 'OVERDUE':
        return <Badge variant="warning" className="gap-1"><AlertCircle className="h-3 w-3" /> Overdue</Badge>
      case 'DELINQUENT':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Delinquent</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUnitTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className={type === 'TWO_BEDROOM' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
        {type === 'TWO_BEDROOM' ? '2 Bedroom' : '1 Bedroom'}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="h-8 w-8" />
            Tenant Management
          </h1>
          <p className="text-muted-foreground">
            Manage all tenants, view their status, and handle apartment assignments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">22 apartments occupied</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.current}</div>
              <p className="text-xs text-muted-foreground">Up to date with payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Pending payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">KSh {stats.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Balance due</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Tenants</CardTitle>
                <CardDescription>
                  Manage tenant information, payments, and apartment assignments
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="/admin/tenants/new">
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Tenant
                  </Button>
                </Link>
                
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants by name, email, apartment, or phone..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="DELINQUENT">Delinquent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading tenants...</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Rent Amount</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Move-in Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No tenants found matching your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTenants.map((tenant) => (
                          <TableRow key={tenant.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{tenant.name}</p>
                                <p className="text-sm text-muted-foreground">{tenant.email}</p>
                                <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{tenant.apartment}</p>
                                {getUnitTypeBadge(tenant.unitType)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">KSh {tenant.rentAmount.toLocaleString()}</p>
                            </TableCell>
                            <TableCell>
                              <p className={`font-medium ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                KSh {tenant.balance.toLocaleString()}
                              </p>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(tenant.status)}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{new Date(tenant.moveInDate).toLocaleDateString()}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/tenants/${tenant.id}`} className="cursor-pointer">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/tenants/${tenant.id}/edit`} className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Tenant
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Tenant
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Summary */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredTenants.length} of {tenants.length} tenants
                  </div>
                  <div className="text-sm font-medium">
                    Total Monthly Rent: <span className="text-primary">KSh {stats.totalRent.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/tenants/new">
                  Register New Tenant
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/payments">
                  View All Payments
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/water-bills">
                  Manage Water Bills
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Recently Added</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenants.slice(0, 3).map(tenant => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.apartment} • {tenant.unitType === 'TWO_BEDROOM' ? '2BR' : '1BR'}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(tenant.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
