import { useState, useCallback } from 'react'
import { usePaymentStore } from '@/store/payment.store'
import { api } from '@/lib/api/client' // ✅ FIXED IMPORT
import { Payment, PaymentCreateDTO, PaymentUpdateDTO } from '@/types/payment.types'

export function usePayments() {
  const {
    payments,
    selectedPayment,
    filters,
    isLoading,
    error,
    setPayments,
    setSelectedPayment,
    setFilters,
    setLoading,
    setError,
    clearError,
  } = usePaymentStore()

  const fetchPayments = useCallback(async (newFilters?: any) => {
    try {
      setLoading(true)
      clearError()

      const filterParams = newFilters || filters
      const params = new URLSearchParams()

      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await api.get(`/payments?${params}`)

      if (response.success && response.data) {
        setPayments(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch payments')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch payments')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setError, clearError, setPayments])

  const fetchPayment = useCallback(async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.get(`/payments/${id}`)

      if (response.success && response.data) {
        setSelectedPayment(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch payment')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch payment')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, setSelectedPayment])

  const createPayment = useCallback(async (data: PaymentCreateDTO) => {
    try {
      setLoading(true)
      clearError()

      const formData = new FormData()
      
      // Append payment data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'files') {
          // Handle files array
          const files = value as File[]
          files.forEach((file, index) => {
            formData.append('files', file)
          })
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string)
        }
      })

      const response = await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.success && response.data) {
        // Refresh payments list
        await fetchPayments()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to create payment')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create payment')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchPayments])

  const verifyPayment = useCallback(async (id: string, data: PaymentUpdateDTO) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.put(`/payments/${id}/verify`, data)

      if (response.success && response.data) {
        // Refresh payment and list
        await fetchPayment(id)
        await fetchPayments()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to verify payment')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify payment')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchPayment, fetchPayments])

  const rejectPayment = useCallback(async (id: string, notes?: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.put(`/payments/${id}/reject`, { adminNotes: notes })

      if (response.success && response.data) {
        // Refresh payment and list
        await fetchPayment(id)
        await fetchPayments()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to reject payment')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to reject payment')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchPayment, fetchPayments])

  const deletePayment = useCallback(async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.delete(`/payments/${id}`)

      if (response.success) {
        // Refresh payments list
        await fetchPayments()
        return { success: true }
      } else {
        setError(response.message || 'Failed to delete payment')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete payment')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchPayments])

  const generateReceipt = useCallback(async (paymentId: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      })

      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${paymentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        return { success: true }
      } else {
        setError('Failed to generate receipt')
        return { success: false, error: 'Failed to generate receipt' }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate receipt')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError])

  return {
    payments,
    selectedPayment,
    filters,
    isLoading,
    error,
    setFilters,
    fetchPayments,
    fetchPayment,
    createPayment,
    verifyPayment,
    rejectPayment,
    deletePayment,
    generateReceipt,
  }
}