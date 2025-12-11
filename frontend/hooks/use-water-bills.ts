import { useState, useEffect, useCallback } from 'react'
import { useWaterStore } from '@/store/water.store'
import { api } from '@/lib/api'
import { WaterReading, WaterReadingCreateData } from '@/types/water.types'

export function useWaterBills() {
  const {
    readings,
    selectedReading,
    summary,
    report,
    isLoading,
    error,
    filters,
    setReadings,
    setSelectedReading,
    setSummary,
    setReport,
    setLoading,
    setError,
    setFilters,
    clearError,
  } = useWaterStore()

  const fetchReadings = useCallback(async (newFilters?: any) => {
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

      const response = await api.get(`/water/readings?${params}`)

      if (response.success && response.data) {
        setReadings(response.data.readings || response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch water readings')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch water readings')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setError, clearError, setReadings])

  const fetchReading = useCallback(async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.get(`/water/readings/${id}`)

      if (response.success && response.data) {
        setSelectedReading(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch water reading')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch water reading')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, setSelectedReading])

  const createReading = useCallback(async (tenantId: string, data: WaterReadingCreateData) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.post(`/water/tenants/${tenantId}/readings`, data)

      if (response.success && response.data) {
        // Refresh readings list
        await fetchReadings()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to create water reading')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create water reading')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchReadings])

  const updateReading = useCallback(async (id: string, data: Partial<WaterReadingCreateData>) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.put(`/water/readings/${id}`, data)

      if (response.success && response.data) {
        // Refresh reading and list
        await fetchReading(id)
        await fetchReadings()
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to update water reading')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update water reading')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchReading, fetchReadings])

  const deleteReading = useCallback(async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.delete(`/water/readings/${id}`)

      if (response.success) {
        // Refresh readings list
        await fetchReadings()
        return { success: true }
      } else {
        setError(response.message || 'Failed to delete water reading')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete water reading')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, fetchReadings])

  const fetchSummary = useCallback(async (month?: string, year?: number) => {
    try {
      setLoading(true)
      clearError()

      const params = new URLSearchParams()
      if (month) params.append('month', month)
      if (year) params.append('year', String(year))

      const response = await api.get(`/water/summary?${params}`)

      if (response.success && response.data) {
        setSummary(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch water summary')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch water summary')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, setSummary])

  const fetchReport = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      clearError()

      const params = new URLSearchParams({ startDate, endDate })
      const response = await api.get(`/water/report?${params}`)

      if (response.success && response.data) {
        setReport(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.message || 'Failed to fetch water report')
        return { success: false, error: response.message }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch water report')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError, setReport])

  const generateWaterBill = useCallback(async (readingId: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await api.get(`/water/readings/${readingId}/bill`, {
        responseType: 'blob',
      })

      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response)
        const a = document.createElement('a')
        a.href = url
        a.download = `water-bill-${readingId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        return { success: true }
      } else {
        setError('Failed to generate water bill')
        return { success: false, error: 'Failed to generate water bill' }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate water bill')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, clearError])

  // Fetch readings on mount
  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  return {
    readings,
    selectedReading,
    summary,
    report,
    isLoading,
    error,
    filters,
    setFilters,
    fetchReadings,
    fetchReading,
    createReading,
    updateReading,
    deleteReading,
    fetchSummary,
    fetchReport,
    generateWaterBill,
  }
}
