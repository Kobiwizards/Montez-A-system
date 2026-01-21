'use client'

import { useState, useEffect } from 'react'
import { TenantTable } from '@/components/admin/tenant-table'
import { tenantApi } from '@/lib/api/tenant'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTenants, setTotalTenants] = useState(0)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching tenants from API...')
      
      // Call the API with limit=100 to get ALL tenants
      const response = await tenantApi.getAllTenants({ limit: 100 })
      
      console.log('📦 API Response:', {
        success: response.success,
        totalInPagination: response.pagination?.total,
        tenantsCount: response.data?.length,
        firstFew: response.data?.slice(0, 3)
      })
      
      if (response.data && Array.isArray(response.data)) {
        setTenants(response.data)
        setTotalTenants(response.pagination?.total || response.data.length)
        console.log(`✅ Loaded ${response.data.length} tenants`)
      } else {
        console.error('❌ Invalid response format:', response)
      }
    } catch (error) {
      console.error('❌ Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      try {
        await tenantApi.deleteTenant(id)
        fetchTenants() // Refresh the list
      } catch (error) {
        console.error('Error deleting tenant:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground">
            Managing {totalTenants} tenants across Montez A Apartments
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Tenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants ({totalTenants})</CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing {tenants.length} tenants • 
            <button 
              onClick={fetchTenants} 
              className="ml-2 text-primary hover:underline"
            >
              Refresh
            </button>
            • {loading ? 'Loading...' : 'Loaded'}
          </div>
        </CardHeader>
        <CardContent>
          {/* DEBUG INFO */}
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
            <div className="font-medium">Debug Info:</div>
            <div>API returned: {tenants.length} tenants</div>
            <div>Database total: {totalTenants} tenants</div>
            <div>First tenant: {tenants[0]?.name || 'None'}</div>
          </div>

          <TenantTable 
            tenants={tenants} 
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}