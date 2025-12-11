import { useState, useEffect, useCallback } from 'react'
import { useAnalyticsStore } from '@/store/analytics.store'
import { api } from '@/lib/api'

// Define types locally
interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  unitType?: string
  status?: string
  apartment?: string
}

type ExportFormat = 'csv' | 'pdf' | 'excel'

export function useAnalytics() {
  const {
    dashboardData,
    occupancyData,
    financialData,
    isLoading,
    error,
    dateRange,
    setDashboardData,
    setOccupancyData,
    setFinancialData,
    setLoading,
    setError,
    setDateRange,
  } = useAnalyticsStore()

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/analytics/dashboard')
      
      if (response.success && response.data) {
        setDashboardData(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch dashboard data' 
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch dashboard data'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setDashboardData])

  // Fetch occupancy analytics
  const fetchOccupancyData = useCallback(async (filters?: AnalyticsFilters) => {
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

      const response = await api.get(`/analytics/occupancy?${params}`)
      
      if (response.success && response.data) {
        setOccupancyData(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch occupancy data' 
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch occupancy data'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setOccupancyData])

  // Fetch financial analytics
  const fetchFinancialData = useCallback(async (filters?: AnalyticsFilters) => {
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

      const response = await api.get(`/analytics/financial?${params}`)
      
      if (response.success && response.data) {
        setFinancialData(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to fetch financial data' 
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch financial data'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setFinancialData])

  // Generate report
  const generateReport = async (type: string, filters: AnalyticsFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.post('/analytics/report', { type, ...filters })
      
      if (response.success && response.data) {
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to generate report' 
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate report'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }

  // Export data
  const exportData = async (type: string, format: ExportFormat, filters?: AnalyticsFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({ type, format })
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value))
          }
        })
      }

      const response = await api.get(`/analytics/export?${params}`, {
        responseType: 'blob'
      })
      
      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        return { success: true }
      } else {
        return { 
          success: false, 
          error: 'Failed to download export' 
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export data'
      setError(errorMessage)
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    dashboardData,
    occupancyData,
    financialData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    fetchDashboardData,
    fetchOccupancyData,
    fetchFinancialData,
    generateReport,
    exportData,
  }
}
