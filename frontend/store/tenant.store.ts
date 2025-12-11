import { create } from 'zustand'
import { Tenant, TenantFilters, TenantStats } from '@/types/tenant.types'

interface TenantStore {
  // State
  tenants: Tenant[]
  selectedTenant: Tenant | null
  filters: TenantFilters
  stats: TenantStats | null
  isLoading: boolean
  error: string | null

  // Actions
  setTenants: (tenants: Tenant[]) => void
  setSelectedTenant: (tenant: Tenant | null) => void
  setFilters: (filters: TenantFilters) => void
  setStats: (stats: TenantStats | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

const initialFilters: TenantFilters = {
  status: undefined,
  apartment: undefined,
  search: '',
  page: 1,
  limit: 20,
}

const initialStats: TenantStats = {
  total: 0,
  current: 0,
  overdue: 0,
  delinquent: 0,
  totalOutstanding: 0,
  averageRent: 0,
  occupancyRate: 0,
}

export const useTenantStore = create<TenantStore>((set) => ({
  // Initial state
  tenants: [],
  selectedTenant: null,
  filters: initialFilters,
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  setTenants: (tenants) => set({ tenants }),
  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
  setFilters: (filters) => set({ filters: { ...initialFilters, ...filters } }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => set({
    tenants: [],
    selectedTenant: null,
    filters: initialFilters,
    stats: null,
    isLoading: false,
    error: null,
  }),
}))
