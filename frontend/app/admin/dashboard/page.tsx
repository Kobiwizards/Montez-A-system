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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/lib/hooks/use-toast'
import { useAuth } from '@/components/shared/auth-provider'
import Link from 'next/link'
import { tenantApi } from '@/lib/api/tenant' // IMPORT API
import { paymentApi } from '@/lib/api/payment' // IMPORT PAYMENT API

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
      console.log('🔄 Fetching tenants from API...')
      
      // REAL API CALL - Fetches ALL tenants from database
      const response = await tenantApi.getAllTenants({ limit: 100 })
      
      console.log('📊 API Response:', {
        success: response.success,
        totalTenants: response.pagination?.total,
        fetchedTenants: response.data?.length,
        firstFew: response.data?.slice(0, 3).map(t => `${t.name} (${t.apartment})`)
      })
      
      if (response.success && Array.isArray(response.data)) {
        setTenants(response.data)
        console.log(`✅ Successfully loaded ${response.data.length} tenants`)
      } else {
        console.error('❌ Invalid response:', response)
        toast({
          title: 'Error',
          description: 'Invalid response from server',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('❌ Error fetching tenants:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tenants',
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
        return <Badge className="bg-green-500 hover:bg-green-600">Current</Badge>
      case 'OVERDUE':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Overdue</Badge>
      case 'DELINQUENT':
        return <Badge className="bg-red-500 hover:bg-red-600">Delinquent</Badge>
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
      // REAL API CALL to delete tenant
      await tenantApi.deleteTenant(id)
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
      })
      fetchTenants() // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tenant',
        variant: 'destructive',
      })
    }
  }

  // Fetch additional stats from API
  const [stats, setStats] = useState({
    total: 0,
    current: 0,
    overdue: 0,
    delinquent: 0,
    totalOutstanding: 0,
    pendingPayments: 0,
    verifiedPayments: 0
  })

  useEffect(() => {
    if (tenants.length > 0) {
      const current = tenants.filter(t => t.status === 'CURRENT').length
      const overdue = tenants.filter(t => t.status === 'OVERDUE').length
      const delinquent = tenants.filter(t => t.status === 'DELINQUENT').length
      const totalOutstanding = tenants.reduce((sum, t) => sum + t.balance, 0)
      
      setStats({
        total: tenants.length,
        current,
        overdue,
        delinquent,
        totalOutstanding,
        pendingPayments: 0, // You can fetch this from paymentApi.getPendingPayments()
        verifiedPayments: 0
      })
    }
  }, [tenants])

  // Quick refresh button
  const handleRefresh = () => {
    fetchTenants()
    toast({
      title: 'Refreshing',
      description: 'Fetching latest tenant data...',
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
              <h1 className="text-3xl font-bold mb-2">Tenant Management</h1>
              <p className="text-muted-foreground">
                Managing {stats.total} tenants across Montez A Apartments
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </Button>
              <Link href="/admin/tenants/new">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Tenant
                </Button>
              </Link>
            </div>
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
                    <p className="text-3xl font-bold text-green-600">{stats.current}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Badge className="bg-green-500 h-6 w-6 flex items-center justify-center">
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
                    <p className="text-3xl font-bold text-yellow-600">{stats.overdue}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Badge className="bg-yellow-500 h-6 w-6 flex items-center justify-center">
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
                    <p className="text-3xl font-bold text-red-600">
                      KSh {stats.totalOutstanding.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Badge className="bg-red-500 h-6 w-6 flex items-center justify-center">
                      $
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info Banner */}
          {tenants.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="font-medium">Debug Info:</span>
                <span>Loaded {tenants.length} tenants from database.</span>
                <span>First tenant: {tenants[0]?.name}</span>
                <span>Last tenant: {tenants[tenants.length - 1]?.name}</span>
              </div>
            </div>
          )}

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
                      <SelectItem value="all">All Status ({tenants.length})</SelectItem>
                      <SelectItem value="CURRENT">Current ({stats.current})</SelectItem>
                      <SelectItem value="OVERDUE">Overdue ({stats.overdue})</SelectItem>
                      <SelectItem value="DELINQUENT">Delinquent ({stats.delinquent})</SelectItem>
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
                {loading && ' • Loading...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading tenants from database...</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={fetchTenants}
                    >
                      Retry
                    </Button>
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
                      : 'No tenants in the database yet'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={fetchTenants} variant="outline">
                      Reload from Database
                    </Button>
                    <Link href="/admin/tenants/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Tenant
                      </Button>
                    </Link>
                  </div>
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
                        <TableRow key={tenant.id} className="hover:bg-gray-50">
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
                            <span className={tenant.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
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
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination or Load More */}
                  {tenants.length > 50 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline">
                        Load More Tenants
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}