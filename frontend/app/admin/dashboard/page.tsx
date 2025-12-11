"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, MoreVertical, Eye, Edit, Trash2, UserPlus } from 'lucide-react'
import { Header } from '@/components/shared/header'
import { Sidebar } from '@/components/shared/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TenantTable } from '@/components/admin/tenant-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { useAuth } from '@/components/shared/auth-provider'
import Link from 'next/link'

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
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockTenants: Tenant[] = [
        {
          id: '1',
          name: 'John Kamau',
          email: 'john.kamau@monteza.com',
          phone: '254712345678',
          apartment: '1A1',
          unitType: 'TWO_BEDROOM',
          rentAmount: 18000,
          balance: 0,
          status: 'CURRENT',
          moveInDate: '2023-01-15',
        },
        {
          id: '2',
          name: 'Mary Wanjiku',
          email: 'mary.wanjiku@monteza.com',
          phone: '254723456789',
          apartment: '1B1',
          unitType: 'ONE_BEDROOM',
          rentAmount: 15000,
          balance: 5000,
          status: 'OVERDUE',
          moveInDate: '2023-02-01',
        },
        {
          id: '3',
          name: 'Peter Kariuki',
          email: 'peter.kariuki@monteza.com',
          phone: '254734567890',
          apartment: '2A1',
          unitType: 'TWO_BEDROOM',
          rentAmount: 18000,
          balance: 18000,
          status: 'DELINQUENT',
          moveInDate: '2023-03-15',
        },
        // Add more mock tenants...
      ]
      setTenants(mockTenants)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tenants',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(search.toLowerCase()) ||
      tenant.apartment.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || tenant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Tenant['status']) => {
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

  const getUnitTypeLabel = (type: Tenant['unitType']) => {
    return type === 'ONE_BEDROOM' ? 'One Bedroom' : 'Two Bedroom'
  }

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return

    try {
      // API call to delete tenant
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
      })
      fetchTenants()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tenant',
        variant: 'destructive',
      })
    }
  }

  const stats = {
    total: tenants.length,
    current: tenants.filter(t => t.status === 'CURRENT').length,
    overdue: tenants.filter(t => t.status === 'OVERDUE').length,
    delinquent: tenants.filter(t => t.status === 'DELINQUENT').length,
    totalOutstanding: tenants.reduce((sum, t) => sum + t.balance, 0),
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
              <h1 className="text-3xl font-bold mb-2">Tenant Management</h1>
              <p className="text-muted-foreground">
                Manage all tenants and their apartments
              </p>
            </div>
            <Link href="/admin/tenants/new">
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add New Tenant
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-3xl font-bold text-success">{stats.current}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Badge variant="success" className="h-6 w-6 flex items-center justify-center">
                      ✓
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-3xl font-bold text-warning">{stats.overdue}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Badge variant="warning" className="h-6 w-6 flex items-center justify-center">
                      !
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-3xl font-bold">KSh {stats.totalOutstanding.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                    <Badge variant="error" className="h-6 w-6 flex items-center justify-center">
                      $
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tenants by name, email, or apartment..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="CURRENT">Current</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                      <SelectItem value="DELINQUENT">Delinquent</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenants Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant List</CardTitle>
              <CardDescription>
                Showing {filteredTenants.length} of {tenants.length} tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="spinner h-8 w-8 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading tenants...</p>
                  </div>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary-800 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
                  <p className="text-muted-foreground mb-6">
                    {search || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No tenants have been added yet'}
                  </p>
                  <Link href="/admin/tenants/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Tenant
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Unit Type</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Move-in Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenants.map((tenant) => (
                        <TableRow key={tenant.id} className="hover:bg-secondary-800/50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{tenant.name}</p>
                              <p className="text-sm text-muted-foreground">{tenant.email}</p>
                              <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tenant.apartment}</Badge>
                          </TableCell>
                          <TableCell>{getUnitTypeLabel(tenant.unitType)}</TableCell>
                          <TableCell className="font-medium">
                            KSh {tenant.rentAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={tenant.balance > 0 ? 'text-error' : 'text-success'}>
                              KSh {tenant.balance.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                          <TableCell>
                            {new Date(tenant.moveInDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/tenants/${tenant.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/tenants/${tenant.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTenant(tenant.id)}
                                className="text-error hover:text-error"
                              >
                                <Trash2 className="h-4 w-4" />
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
        </main>
      </div>
    </div>
  )
}
