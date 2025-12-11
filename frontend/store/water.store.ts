import { create } from 'zustand'
import { WaterReading, WaterBill } from '@/types/water.types'

// Define local types based on what's in water.types.ts
interface WaterBillSummary {
  totalUnits: number
  totalAmount: number
  averageConsumption: number
  highestConsumer: string
  lowestConsumer: string
  paymentRate: number
}

interface WaterConsumptionReport {
  period: {
    start: string
    end: string
  }
  summary: WaterBillSummary
  monthlyData: Array<{
    month: string
    totalUnits: number
    totalAmount: number
    paidUnits: number
    paidAmount: number
    readings: Array<{
      apartment: string
      tenantName: string
      units: number
      amount: number
      paid: boolean
    }>
  }>
  apartmentRanking: Array<{
    apartment: string
    units: number
  }>
  extremes: {
    highestConsumer?: {
      apartment: string
      units: number
    }
    lowestConsumer?: {
      apartment: string
      units: number
    }
  }
}

interface WaterStore {
  // State
  readings: WaterReading[]
  selectedReading: WaterReading | null
  summary: WaterBillSummary | null
  report: WaterConsumptionReport | null
  isLoading: boolean
  error: string | null
  filters: {
    month?: string
    year?: number
    apartment?: string
    paid?: boolean
  }

  // Actions
  setReadings: (readings: WaterReading[]) => void
  setSelectedReading: (reading: WaterReading | null) => void
  setSummary: (summary: WaterBillSummary | null) => void
  setReport: (report: WaterConsumptionReport | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: any) => void
  clearError: () => void
  reset: () => void
}

const initialFilters = {
  month: undefined,
  year: new Date().getFullYear(),
  apartment: undefined,
  paid: undefined,
}

export const useWaterStore = create<WaterStore>((set) => ({
  // Initial state
  readings: [],
  selectedReading: null,
  summary: null,
  report: null,
  isLoading: false,
  error: null,
  filters: initialFilters,

  // Actions
  setReadings: (readings) => set({ readings }),
  setSelectedReading: (reading) => set({ selectedReading: reading }),
  setSummary: (summary) => set({ summary }),
  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters: { ...initialFilters, ...filters } }),
  clearError: () => set({ error: null }),
  reset: () => set({
    readings: [],
    selectedReading: null,
    summary: null,
    report: null,
    isLoading: false,
    error: null,
    filters: initialFilters,
  }),
}))
