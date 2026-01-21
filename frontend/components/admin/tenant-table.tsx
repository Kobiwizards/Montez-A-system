'use client'

import { useState, useEffect } from 'react'
import { tenantApi, Tenant } from '@/lib/api/tenant'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, UserPlus } from 'lucide-react'

export default function TenantTable() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTenants, setTotalTenants] = useState(0)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      console.log('Fetching tenants...')
      const response = await tenantApi.getAllTenants({ limit: 100 })
      
      console.log('Tenants API Response:', response)
      console.log('Total tenants in response:', response.pagination?.total)
      console.log('Tenants data length:', response.data?.length)
      
      if (response.data && Array.isArray(response.data)) {
        setTenants(response.data)
        setTotalTenants(response.pagination?.total || response.data.length)
      } else {
        console.error('Invalid response format:', response)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CURRENT': return 'bg-green-500'
      case 'OVERDUE': return 'bg-yellow-500'
      case 'DELINQUENT': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getUnitTypeText = (type: string) => {
    return type === 'TWO_BEDROOM' ? '2 Bedroom' : '1 Bedroom'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading tenants...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tenant Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total Tenants: {totalTenants} • Showing {tenants.length}
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </CardHeader>
      <CardContent>
        {tenants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No tenants found</p>
            <Button variant="outline" className="mt-4" onClick={fetchTenants}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Apartment</th>
                  <th className="text-left p-3">Unit Type</th>
                  <th className="text-left p-3">Rent</th>
                  <th className="text-left p-3">Balance</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground">{tenant.email}</div>
                    </td>
                    <td className="p-3 font-medium">{tenant.apartment}</td>
                    <td className="p-3">{getUnitTypeText(tenant.unitType)}</td>
                    <td className="p-3">KSh {tenant.rentAmount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={tenant.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        KSh {tenant.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          Debug Info: Loaded {tenants.length} tenants. Backend reports {totalTenants} total tenants.
        </div>
      </CardContent>
    </Card>
  )
}