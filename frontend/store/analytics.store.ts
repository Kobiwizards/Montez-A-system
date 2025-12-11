import { create } from 'zustand'

// Define types locally since we can't guarantee the types file exists
interface AnalyticsData {
  summary: {
    totalTenants: number
    totalUnits: number
    occupancyRate: number
    totalRentDue: number
    totalRentPaid: number
    totalWaterDue: number
    totalWaterPaid: number
    pendingPayments: number
    verifiedPayments: number
  }
  monthlyTrends: Array<{
    month: string
    rentCollected: number
    rentDue: number
    waterCollected: number
    waterDue: number
    newTenants: number
    vacancies: number
  }>
  tenantStatus: {
    current: number
    overdue: number
    delinquent: number
    evicted: number
    former: number
  }
  unitStatus: {
    occupied: number
    vacant: number
    maintenance: number
  }
}

interface OccupancyData {
  occupancyRate: number
  vacancyRate: number
  monthlyTrend: Array<{
    month: string
    occupancyRate: number
    vacancyRate: number
  }>
  byUnitType: Array<{
    unitType: string
    totalUnits: number
    occupiedUnits: number
    vacancyRate: number
  }>
  tenantRetention: Array<{
    month: string
    retainedTenants: number
    newTenants: number
    churnRate: number
  }>
}

interface FinancialData {
  revenue: {
    total: number
    rent: number
    water: number
    other: number
  }
  expenses: {
    total: number
    maintenance: number
    utilities: number
    staff: number
    other: number
  }
  netIncome: number
  monthlyTrend: Array<{
    month: string
    revenue: number
    expenses: number
    netIncome: number
  }>
  paymentStatus: {
    paid: number
    pending: number
    overdue: number
    delinquent: number
  }
  outstandingBalances: Array<{
    tenantName: string
    apartment: string
    balance: number
    status: string
  }>
}

interface AnalyticsStore {
  // State
  dashboardData: AnalyticsData | null
  occupancyData: OccupancyData | null
  financialData: FinancialData | null
  isLoading: boolean
  error: string | null
  dateRange: {
    startDate: string
    endDate: string
  }

  // Actions
  setDashboardData: (data: AnalyticsData) => void
  setOccupancyData: (data: OccupancyData) => void
  setFinancialData: (data: FinancialData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setDateRange: (range: { startDate: string; endDate: string }) => void
  reset: () => void
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  // Initial state
  dashboardData: null,
  occupancyData: null,
  financialData: null,
  isLoading: false,
  error: null,
  dateRange: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },

  // Actions
  setDashboardData: (data) => set({ dashboardData: data }),
  setOccupancyData: (data) => set({ occupancyData: data }),
  setFinancialData: (data) => set({ financialData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setDateRange: (range) => set({ dateRange: range }),
  reset: () => set({
    dashboardData: null,
    occupancyData: null,
    financialData: null,
    isLoading: false,
    error: null,
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  }),
}))
