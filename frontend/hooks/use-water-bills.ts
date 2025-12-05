import { useState, useEffect, useCallback } from 'react'
import { useWaterStore } from '@/store/water.store'
import { api } from '@/lib/api'
import { WaterBill, WaterReading, CreateReadingData, WaterBillFilters } from '@/types/water.types'

export function useWaterBills() {
  const {
    bills,
    readings,
    selectedBill,
    isLoading,
    error,
    filters,
    pagination,
    setBills,
    setReadings,
    setSelectedBill,
    setLoading,
    setError,
    setFilters,
    setPagination,
    addReading: storeAddReading,
    updateBill: storeUpdateBill,
    markPaid: storeMarkPaid,
    clearFilters: storeClearFilters,
  } = useWaterStore()

  // Fetch water bills
  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await api.get(`/water/bills?${params}`)
      
      if (response.success && response.data) {
        setBills(response.data)
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
      } else {
        setError(response.message || 'Failed to fetch water bills')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch water bills')
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setError, setBills, setPagination])

  // Fetch water readings
  const fetchReadings = useCallback(async (tenantId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const url = tenantId ? `/water/readings/tenant/${tenantId}` : '/water/readings'
      const response = await api.get(url)
      
      if (response.success && response.data) {
        setReadings(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch water readings' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch water readings' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setReadings])

  // Submit new water reading
  const submitReading = async (data: CreateReadingData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/water/readings', data)
      
      if (response.success && response.data) {
        storeAddReading(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to submit reading' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to submit reading' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Mark bill as paid
  const markBillAsPaid = async (billId: string, paymentId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.put(`/water/bills/${billId}/pay`, { paymentId })
      
      if (response.success && response.data) {
        storeMarkPaid(billId, paymentId)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to mark bill as paid' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to mark bill as paid' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate water bill
  const calculateBill = async (previousReading: number, currentReading: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/water/calculate', {
        previousReading,
        currentReading
      })
      
      if (response.success && response.data) {
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to calculate bill' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to calculate bill' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Get bill by ID
  const getBillById = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/water/bills/${id}`)
      
      if (response.success && response.data) {
        setSelectedBill(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch bill' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch bill' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setSelectedBill])

  // Get tenant water bills
  const getTenantBills = useCallback(async (tenantId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/water/bills/tenant/${tenantId}`)
      
      if (response.success && response.data) {
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch tenant bills' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch tenant bills' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  // Clear filters
  const clearFilters = () => {
    storeClearFilters()
  }

  // Fetch bills on filter change
  useEffect(() => {
    fetchBills()
  }, [filters.page, filters.limit, fetchBills])

  return {
    bills,
    readings,
    selectedBill,
    isLoading,
    error,
    filters,
    pagination,
    setFilters,
    fetchBills,
    fetchReadings,
    submitReading,
    markBillAsPaid,
    calculateBill,
    getBillById,
    getTenantBills,
    clearFilters,
  }
}