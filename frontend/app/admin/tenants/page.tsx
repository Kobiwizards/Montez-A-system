'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import TenantTable from '@/components/admin/tenant-table'
import { tenantApi } from '@/lib/api/tenant'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export default function TenantsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTenants, setTotalTenants] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchTenants()
    }
  }, [isAuthenticated, user])

  const fetchTenants = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching tenants from API...')
      
      const response = await tenantApi.getAllTenants({ limit: 100 })
      
      if (response.data && Array.isArray(response.data)) {
        setTenants(response.data)
        setTotalTenants(response.pagination?.total || response.data.length)
      } else {
        console.error('❌ Invalid response format:', response)
      }
    } catch (error) {
      console.error('❌ Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null
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
          <TenantTable />
        </CardContent>
      </Card>
    </div>
  )
}