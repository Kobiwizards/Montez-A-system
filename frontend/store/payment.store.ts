import { create } from 'zustand'
import { Payment } from '@/types/payment.types'

interface PaymentState {
  payments: Payment[]
  pendingPayments: Payment[]
  filteredPayments: Payment[]
  selectedPayment: Payment | null
  isLoading: boolean
  error: string | null
  filters: {
    status?: string
    type?: string
    month?: string
    tenantId?: string
    page?: number
    limit?: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  
  // Actions
  setPayments: (payments: Payment[]) => void
  setPendingPayments: (payments: Payment[]) => void
  setFilteredPayments: (payments: Payment[]) => void
  setSelectedPayment: (payment: Payment | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<PaymentState['filters']>) => void
  setPagination: (pagination: Partial<PaymentState['pagination']>) => void
  addPayment: (payment: Payment) => void
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void
  deletePayment: (paymentId: string) => void
  verifyPayment: (paymentId: string, status: 'VERIFIED' | 'REJECTED', adminNotes?: string) => void
  clearFilters: () => void
  resetState: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  pendingPayments: [],
  filteredPayments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  setPayments: (payments) => set({ payments }),

  setPendingPayments: (payments) => set({ pendingPayments: payments }),

  setFilteredPayments: (payments) => set({ filteredPayments: payments }),

  setSelectedPayment: (payment) => set({ selectedPayment: payment }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination },
  })),

  addPayment: (payment) => set((state) => ({
    payments: [payment, ...state.payments],
    pendingPayments: payment.status === 'PENDING' 
      ? [payment, ...state.pendingPayments]
      : state.pendingPayments,
  })),

  updatePayment: (paymentId, updates) => set((state) => {
    const updatedPayments = state.payments.map((payment) =>
      payment.id === paymentId ? { ...payment, ...updates } : payment
    )
    
    const updatedPendingPayments = updates.status !== 'PENDING'
      ? state.pendingPayments.filter(p => p.id !== paymentId)
      : state.pendingPayments.map((payment) =>
          payment.id === paymentId ? { ...payment, ...updates } : payment
        )

    return {
      payments: updatedPayments,
      pendingPayments: updatedPendingPayments,
      selectedPayment: state.selectedPayment?.id === paymentId
        ? { ...state.selectedPayment, ...updates }
        : state.selectedPayment,
    }
  }),

  deletePayment: (paymentId) => set((state) => ({
    payments: state.payments.filter(p => p.id !== paymentId),
    pendingPayments: state.pendingPayments.filter(p => p.id !== paymentId),
    selectedPayment: state.selectedPayment?.id === paymentId
      ? null
      : state.selectedPayment,
  })),

  verifyPayment: (paymentId, status, adminNotes) => set((state) => ({
    payments: state.payments.map((payment) =>
      payment.id === paymentId
        ? { 
            ...payment, 
            status, 
            adminNotes,
            verifiedAt: new Date().toISOString(),
          }
        : payment
    ),
    pendingPayments: state.pendingPayments.filter(p => p.id !== paymentId),
    selectedPayment: state.selectedPayment?.id === paymentId
      ? { 
          ...state.selectedPayment, 
          status, 
          adminNotes,
          verifiedAt: new Date().toISOString(),
        }
      : state.selectedPayment,
  })),

  clearFilters: () => set({
    filters: {
      page: 1,
      limit: 20,
    },
  }),

  resetState: () => set({
    payments: [],
    pendingPayments: [],
    filteredPayments: [],
    selectedPayment: null,
    isLoading: false,
    error: null,
    filters: {
      page: 1,
      limit: 20,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
  }),
}))