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
  // Get all tenants (admin) - UPDATED: Default limit 100
  async getAllTenants(params?: {
    page?: number
    limit?: number
    status?: string
    apartment?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Tenant>> {
    const finalParams = {
      limit: 100, // Get all tenants
      page: 1,
      sortBy: 'apartment',
      sortOrder: 'asc',
      ...params
    }
    return api.get('/tenants', { params: finalParams })
  }

  // Get tenant by ID (admin)
  async getTenantById(id: string): Promise<{ success: boolean; data: Tenant }> {
    return api.get(`/tenants/${id}`)
  }

  // Get tenant dashboard (tenant)
  async getDashboard(): Promise<{ success: boolean; data: any }> {
    return api.get('/tenants/dashboard/me')
  }

  // Create tenant (admin)
  async createTenant(data: any): Promise<{ success: boolean; message: string; data: Tenant }> {
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
}

export const tenantApi = new TenantAPI()