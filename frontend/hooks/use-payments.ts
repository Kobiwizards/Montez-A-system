import { useState, useEffect, useCallback } from 'react'
import { usePaymentStore } from '@/store/payment.store'
import { api } from '@/lib/api'
import { Payment, CreatePaymentData, VerifyPaymentData } from '@/types/payment.types'

export function usePayments() {
  const {
    payments,
    pendingPayments,
    filteredPayments,
    selectedPayment,
    isLoading,
    error,
    filters,
    pagination,
    setPayments,
    setPendingPayments,
    setFilteredPayments,
    setSelectedPayment,
    setLoading,
    setError,
    setFilters,
    setPagination,
    addPayment: storeAddPayment,
    updatePayment: storeUpdatePayment,
    deletePayment: storeDeletePayment,
    verifyPayment: storeVerifyPayment,
    clearFilters: storeClearFilters,
  } = usePaymentStore()

  const [uploading, setUploading] = useState(false)

  // Fetch payments with current filters
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await api.get(`/payments?${params}`)
      
      if (response.success && response.data) {
        setPayments(response.data)
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
        
        // Update filtered payments based on current filters
        let filtered = response.data
        if (filters.status) {
          filtered = filtered.filter((p: Payment) => p.status === filters.status)
        }
        if (filters.type) {
          filtered = filtered.filter((p: Payment) => p.type === filters.type)
        }
        if (filters.month) {
          filtered = filtered.filter((p: Payment) => p.month === filters.month)
        }
        setFilteredPayments(filtered)
      } else {
        setError(response.message || 'Failed to fetch payments')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setError, setPayments, setPagination, setFilteredPayments])

  // Fetch pending payments
  const fetchPendingPayments = useCallback(async () => {
    try {
      const response = await api.get('/payments/pending')
      
      if (response.success && response.data) {
        setPendingPayments(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch pending payments:', error)
    }
  }, [setPendingPayments])

  // Create new payment
  const createPayment = async (data: CreatePaymentData, files: File[]) => {
    try {
      setUploading(true)
      setError(null)
      
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string)
        }
      })
      
      files.forEach((file, index) => {
        formData.append('screenshots', file)
      })

      const response = await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      if (response.success && response.data) {
        storeAddPayment(response.data)
        await fetchPendingPayments()
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Payment submission failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Payment submission failed' 
      }
    } finally {
      setUploading(false)
    }
  }

  // Verify payment
  const verifyPayment = async (paymentId: string, data: VerifyPaymentData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.put(`/payments/${paymentId}/verify`, data)
      
      if (response.success && response.data) {
        storeVerifyPayment(paymentId, data.status, data.adminNotes)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Payment verification failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Payment verification failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete payment
  const deletePayment = async (paymentId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.delete(`/payments/${paymentId}`)
      
      if (response.success) {
        storeDeletePayment(paymentId)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.message || 'Payment deletion failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Payment deletion failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Get payment by ID
  const getPaymentById = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/payments/${id}`)
      
      if (response.success && response.data) {
        setSelectedPayment(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch payment' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch payment' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setSelectedPayment])

  // Fetch tenant payment history
  const fetchTenantPayments = useCallback(async (filters?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value))
          }
        })
      }

      const response = await api.get(`/payments/me/history?${params}`)
      
      if (response.success && response.data) {
        setPayments(response.data)
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch payments' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch payments' 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setPayments, setPagination])

  // Clear filters
  const clearFilters = () => {
    storeClearFilters()
  }

  // Fetch payments on filter change
  useEffect(() => {
    fetchPayments()
  }, [filters.page, filters.limit, fetchPayments])

  // Fetch pending payments on mount
  useEffect(() => {
    fetchPendingPayments()
  }, [fetchPendingPayments])

  return {
    payments,
    pendingPayments,
    filteredPayments,
    selectedPayment,
    isLoading,
    error,
    uploading,
    filters,
    pagination,
    setFilters,
    fetchPayments,
    fetchPendingPayments,
    createPayment,
    verifyPayment,
    deletePayment,
    getPaymentById,
    fetchTenantPayments,
    clearFilters,
  }
}