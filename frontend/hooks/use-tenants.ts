import { useState, useCallback } from 'react'
import { useTenantStore } from '@/store/tenant.store'
import { api } from '@/lib/api/client' // ✅ FIXED IMPORT
import { Tenant, UpdateTenantData, TenantFilters } from '@/types/tenant.types'

export function useTenants() {
  const {
    tenants,
    selectedTenant,
    error,
    filters,
    stats,
    isLoading,
    setTenants,
    setSelectedTenant,
    setLoading,
    setError,
    clearError,
    setStats,
    setFilters,
  } = useTenantStore()

  const fetchTenants = useCallback(async (newFilters?: TenantFilters) => {
    try {
      setLoading(true)
      clearError()

      const filterParams = newFilters || filters
      const params = new URLSearchParams()

      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, String(value))
        }
      })

      const response = await api.get(`/tenants?${params}`)

      if (response.success && response.data) {
        setTenants(response.data.tenants || response.data)
        
        // Update stats if provided
        if (response.data.stats) {
          setStats(response.data.stats)
        }
        
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch tenants')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tenants')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setError, clearError, setTenants, setStats])

  const fetchTenant = useCallback(async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.get(`/tenants/${id}`)

      if (response.success && response.data) {
        setSelectedTenant(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch tenant')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tenant')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, setSelectedTenant])

  const createTenant = useCallback(async (data: any) => {
    try {
      setLoading(true)
      clearError()

      const formData = new FormData()
      
      // Append tenant data
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string)
        }
      })

      const response = await api.post('/tenants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.success && response.data) {
        // Refresh tenants list
        await fetchTenants()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to create tenant')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create tenant')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchTenants])

  const updateTenant = useCallback(async (id: string, data: UpdateTenantData) => {
    try {
      setLoading(true)
      clearError()

      const formData = new FormData()
      
      // Append tenant data
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string)
        }
      })

      const response = await api.put(`/tenants/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.success && response.data) {
        // Refresh tenant and list
        await fetchTenant(id)
        await fetchTenants()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to update tenant')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update tenant')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchTenant, fetchTenants])

  const deleteTenant = useCallback(async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.delete(`/tenants/${id}`)

      if (response.success) {
        // Refresh tenants list
        await fetchTenants()
        return { success: true }
      } else {
        setError(response.message || 'Failed to delete tenant')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete tenant')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchTenants])

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      clearError()

      const response = await api.get('/tenants/stats')

      if (response.success && response.data) {
        setStats(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch stats')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch stats')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, setStats])

  const sendNotification = useCallback(async (tenantId: string, title: string, message: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.post(`/tenants/${tenantId}/notify`, { title, message })

      if (response.success) {
        return { success: true }
      } else {
        setError(response.message || 'Failed to send notification')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send notification')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError])

  return {
    tenants,
    selectedTenant,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    fetchTenants,
    fetchTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    fetchStats,
    sendNotification,
  }
}