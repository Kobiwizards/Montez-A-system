import { api } from './client'

export interface Tenant {
  id: string
  email: string
  phone: string
  name: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rentAmount: number
  waterRate: number
  balance: number
  status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT' | 'EVICTED' | 'FORMER'
  moveInDate: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopyUrl?: string
  contractUrl?: string
  createdAt: string
  updatedAt: string
}

export interface TenantDashboard {
  currentBalance: number
  totalPaid: number
  totalDue: number
  nextPaymentDate?: string
  recentPayments: Array<{
    id: string
    month: string
    amount: number
    status: string
    date: string
  }>
  upcomingPayments: Array<{
    id: string
    dueDate: string
    amount: number
    type: string
  }>
  quickStats: {
    rentAmount: number
    waterBill: number
    daysInApartment: number
    lastPaymentDate?: string
    paymentsThisMonth: number
    pendingPayments: number
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

class TenantAPI {
  // Get tenant dashboard data
  async getDashboard(): Promise<{ success: boolean; data: TenantDashboard }> {
    return api.get('/tenants/dashboard/me')
  }

  // Get tenant by ID (admin)
  async getTenantById(id: string): Promise<{ success: boolean; data: Tenant }> {
    return api.get(`/tenants/${id}`)
  }

  // Get all tenants (admin)
  async getAllTenants(params?: {
    page?: number
    limit?: number
    status?: string
    apartment?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Tenant>> {
    return api.get('/tenants', { params })
  }

  // Create tenant (admin)
  async createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; data: Tenant }> {
    return api.post('/tenants', data)
  }

  // Update tenant (admin)
  async updateTenant(id: string, data: Partial<Tenant>): Promise<{ success: boolean; message: string; data: Tenant }> {
    return api.put(`/tenants/${id}`, data)
  }

  // Delete tenant (admin)
  async deleteTenant(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/tenants/${id}`)
  }

  // Update tenant balance (admin)
  async updateBalance(id: string, balance: number): Promise<{ success: boolean; message: string; data: Tenant }> {
    return api.put(`/tenants/${id}/balance`, { balance })
  }
}

export const tenantApi = new TenantAPI()
