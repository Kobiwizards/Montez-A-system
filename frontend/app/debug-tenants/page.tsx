'use client'

import { useEffect, useState } from 'react'
import { tenantApi } from '@/lib/api/tenant'

export default function DebugTenantsPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    const testApi = async () => {
      const response = await tenantApi.getAllTenants({ limit: 100 })
      setApiResponse(response)
      console.log('DEBUG API RESPONSE:', response)
    }
    testApi()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tenants API Debug</h1>
      
      {apiResponse && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold">Response Structure:</h2>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
          
          <div className="p-4 bg-blue-50 rounded">
            <h2 className="font-bold">Summary:</h2>
            <p>Success: {apiResponse.success ? '✅' : '❌'}</p>
            <p>Total Tenants in Pagination: {apiResponse.pagination?.total}</p>
            <p>Tenants Array Length: {apiResponse.data?.length}</p>
            <p>First 3 tenants: {apiResponse.data?.slice(0, 3).map(t => t.name).join(', ')}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded">
            <h2 className="font-bold">All Tenants ({apiResponse.data?.length}):</h2>
            <ul>
              {apiResponse.data?.map((tenant: any) => (
                <li key={tenant.id} className="border-b py-2">
                  {tenant.name} - {tenant.apartment} - KSh {tenant.balance}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}