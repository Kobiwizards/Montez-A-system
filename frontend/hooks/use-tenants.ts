import { useState, useEffect, useCallback } from 'react'
import { useTenantStore } from '@/store/tenant.store'
import { api } from '@/lib/api'
import { Tenant, UpdateTenantData, TenantFilters } from '@/types/tenant.types'

export function useTenants() {
  const {
    tenants,
    selectedTenant,
    isLoading,
    error,
    filters,
    pagination,
    setTenants,
    setSelectedTenant,
    setLoading,
    setError,
    setFilters,
    setPagination,
    updateTenant: storeUpdateTenant,
    deleteTenant: storeDeleteTenant,
    clearFilters: storeClearFilters,
  } = useTenantStore()

  // Fetch tenants with current filters
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await api.get(`/tenants?${params}`)
      
      if (response.success && response.data) {
        setTenants(response.data)
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
      } else {
        setError(response.message || 'Failed to fetch tenants')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tenants')
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setError, setTenants, setPagination])

  // Get tenant by ID
  const getTenantById = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/tenants/${id}`)
      
      if (response.success && response.data) {
        setSelectedTenant(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch tenant' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch tenant' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setSelectedTenant])

  // Get tenant by apartment number
  const getTenantByApartment = useCallback(async (apartment: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/tenants/apartment/${apartment}`)
      
      if (response.success && response.data) {
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch tenant' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch tenant' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  // Update tenant
  const updateTenant = async (id: string, data: UpdateTenantData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.put(`/tenants/${id}`, data)
      
      if (response.success && response.data) {
        storeUpdateTenant(id, data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to update tenant' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to update tenant' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete tenant
  const deleteTenant = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.delete(`/tenants/${id}`)
      
      if (response.success) {
        storeDeleteTenant(id)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to delete tenant' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to delete tenant' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Update tenant balance
  const updateBalance = async (id: string, amount: number, type: 'add' | 'subtract') => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.put(`/tenants/${id}/balance`, { amount, type })
      
      if (response.success && response.data) {
        storeUpdateTenant(id, { balance: response.data.balance })
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to update balance' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to update balance' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Get tenant statistics
  const getTenantStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/tenants/stats')
      
      if (response.success && response.data) {
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch tenant stats' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch tenant stats' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  // Clear filters
  const clearFilters = () => {
    storeClearFilters()
  }

  // Fetch tenants on filter change
  useEffect(() => {
    fetchTenants()
  }, [filters.page, filters.limit, fetchTenants])

  return {
    tenants,
    selectedTenant,
    isLoading,
    error,
    filters,
    pagination,
    setFilters,
    fetchTenants,
    getTenantById,
    getTenantByApartment,
    updateTenant,
    deleteTenant,
    updateBalance,
    getTenantStats,
    clearFilters,
  }
}