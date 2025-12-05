import { create } from 'zustand'
import { User } from '@/types/auth.types'
import { Payment } from '@/types/payment.types'
import { Receipt } from '@/types/receipt.types'
import { WaterReading } from '@/types/water.types'

interface TenantState {
  currentTenant: User | null
  payments: Payment[]
  receipts: Receipt[]
  waterReadings: WaterReading[]
  balance: number
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentTenant: (tenant: User) => void
  setPayments: (payments: Payment[]) => void
  setReceipts: (receipts: Receipt[]) => void
  setWaterReadings: (readings: WaterReading[]) => void
  setBalance: (balance: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addPayment: (payment: Payment) => void
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void
  addReceipt: (receipt: Receipt) => void
  addWaterReading: (reading: WaterReading) => void
  updateWaterReading: (readingId: string, updates: Partial<WaterReading>) => void
  clearState: () => void
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: null,
  payments: [],
  receipts: [],
  waterReadings: [],
  balance: 0,
  isLoading: false,
  error: null,

  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

  setPayments: (payments) => set({ payments }),

  setReceipts: (receipts) => set({ receipts }),

  setWaterReadings: (readings) => set({ waterReadings: readings }),

  setBalance: (balance) => set({ balance }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  addPayment: (payment) => set((state) => ({
    payments: [payment, ...state.payments],
  })),

  updatePayment: (paymentId, updates) => set((state) => ({
    payments: state.payments.map((payment) =>
      payment.id === paymentId ? { ...payment, ...updates } : payment
    ),
  })),

  addReceipt: (receipt) => set((state) => ({
    receipts: [receipt, ...state.receipts],
  })),

  addWaterReading: (reading) => set((state) => ({
    waterReadings: [reading, ...state.waterReadings],
  })),

  updateWaterReading: (readingId, updates) => set((state) => ({
    waterReadings: state.waterReadings.map((reading) =>
      reading.id === readingId ? { ...reading, ...updates } : reading
    ),
  })),

  clearState: () => set({
    currentTenant: null,
    payments: [],
    receipts: [],
    waterReadings: [],
    balance: 0,
    isLoading: false,
    error: null,
  }),
}))