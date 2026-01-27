import { useState, useEffect, useCallback } from 'react'
import { useAnalyticsStore } from '@/store/analytics.store'
import { api } from '@/lib/api/client'

// Define proper types that match your store
interface AnalyticsData {
  summary?: {
    totalRevenue: number;
    totalTenants: number;
    occupancyRate: number;
    pendingPayments: number;
    averageRent: number;
    waterBillsDue: number;
  };
  monthlyTrends?: Array<{
    month: string;
    revenue: number;
    payments: number;
    occupancy: number;
  }>;
  tenantStatus?: {
    current: number;
    overdue: number;
    delinquent: number;
    evicted: number;
  };
  unitStatus?: {
    occupied: number;
    vacant: number;
    maintenance: number;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    date: string;
  }>;
}

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
      
      const response = await api.get<any>('/analytics/dashboard')
      
      // Type cast to AnalyticsData
      const data = response as any
      
      if (data.success && data.data) {
        // Transform data to match AnalyticsData type if needed
        const dashboardData: AnalyticsData = {
          summary: data.data.summary || {
            totalRevenue: data.data.totalRevenue || 0,
            totalTenants: data.data.totalTenants || 0,
            occupancyRate: data.data.occupancyRate || 0,
            pendingPayments: data.data.pendingPayments || 0,
            averageRent: data.data.averageRent || 0,
            waterBillsDue: data.data.waterBillsDue || 0,
          },
          monthlyTrends: data.data.monthlyTrends || data.data.trends || [],
          tenantStatus: data.data.tenantStatus || {
            current: data.data.currentTenants || 0,
            overdue: data.data.overdueTenants || 0,
            delinquent: data.data.delinquentTenants || 0,
            evicted: data.data.evictedTenants || 0,
          },
          unitStatus: data.data.unitStatus || {
            occupied: data.data.occupiedUnits || 0,
            vacant: data.data.vacantUnits || 0,
            maintenance: data.data.maintenanceUnits || 0,
          },
          recentActivity: data.data.recentActivity || data.data.activity || [],
        }
        
        setDashboardData(dashboardData)
        return { success: true, data: dashboardData }
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch dashboard data' 
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

      const response = await api.get<any>(`/analytics/occupancy?${params}`)
      
      const data = response as any
      
      if (data.success && data.data) {
        setOccupancyData(data.data)
        return { success: true, data: data.data }
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch occupancy data' 
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

      const response = await api.get<any>(`/analytics/financial?${params}`)
      
      const data = response as any
      
      if (data.success && data.data) {
        setFinancialData(data.data)
        return { success: true, data: data.data }
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to fetch financial data' 
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
      
      const response = await api.post<any>('/analytics/report', { type, ...filters })
      
      const data = response as any
      
      if (data.success && data.data) {
        return { success: true, data: data.data }
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to generate report' 
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