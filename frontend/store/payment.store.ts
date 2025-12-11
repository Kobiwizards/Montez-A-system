import { create } from 'zustand'
import { Payment, PaymentFilter } from '@/types/payment.types'

interface PaymentStore {
  // State
  payments: Payment[]
  selectedPayment: Payment | null
  filters: PaymentFilter
  isLoading: boolean
  error: string | null

  // Actions
  setPayments: (payments: Payment[]) => void
  setSelectedPayment: (payment: Payment | null) => void
  setFilters: (filters: PaymentFilter) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

const initialFilters: PaymentFilter = {
  status: undefined,
  type: undefined,
  month: undefined,
  year: new Date().getFullYear(),
  tenantId: undefined,
  page: 1,
  limit: 20,
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  // Initial state
  payments: [],
  selectedPayment: null,
  filters: initialFilters,
  isLoading: false,
  error: null,

  // Actions
  setPayments: (payments) => set({ payments }),
  setSelectedPayment: (payment) => set({ selectedPayment: payment }),
  setFilters: (filters) => set({ filters: { ...initialFilters, ...filters } }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => set({
    payments: [],
    selectedPayment: null,
    filters: initialFilters,
    isLoading: false,
    error: null,
  }),
}))
