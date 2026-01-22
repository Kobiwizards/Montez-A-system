import { api } from './index'

export interface WaterReading {
  id: string
  tenantId: string
  previousReading: number
  currentReading: number
  units: number
  rate: number
  amount: number
  month: string
  year: number
  paid: boolean
  createdAt: string
  updatedAt?: string
  tenant?: {
    id: string
    name: string
    email: string
    phone: string
    apartment: string
    unitType: string
  }
  paymentId?: string
}

export interface WaterReadingRequest {
  tenantId: string
  previousReading: number
  currentReading: number
  month: string
  year: number
}

export interface WaterReadingResponse {
  success: boolean
  message: string
  data: WaterReading | WaterReading[] | null
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const waterApi = {
  // Get all water readings
  async getAllReadings(params?: {
    page?: number
    limit?: number
    month?: string
    year?: number
    paid?: boolean
  }): Promise<WaterReadingResponse> {
    return api.get('/water/readings', { params })
  },

  // Get readings for a specific tenant
  async getTenantReadings(tenantId: string, params?: {
    page?: number
    limit?: number
  }): Promise<WaterReadingResponse> {
    return api.get(`/water/tenants/${tenantId}/readings`, { params })
  },

  // Get a single reading by ID
  async getReadingById(id: string): Promise<WaterReadingResponse> {
    return api.get(`/water/readings/${id}`)
  },

  // Create a new water reading
  async createReading(data: WaterReadingRequest): Promise<WaterReadingResponse> {
    return api.post('/water/readings', data)
  },

  // Update a water reading
  async updateReading(id: string, data: Partial<WaterReadingRequest>): Promise<WaterReadingResponse> {
    return api.put(`/water/readings/${id}`, data)
  },

  // Delete a water reading
  async deleteReading(id: string): Promise<WaterReadingResponse> {
    return api.delete(`/water/readings/${id}`)
  },

  // Mark reading as paid
  async markAsPaid(id: string, paymentId: string): Promise<WaterReadingResponse> {
    return api.patch(`/water/readings/${id}/pay`, { paymentId })
  },

  // Get water statistics
  async getWaterStats(params?: {
    month?: string
    year?: number
  }): Promise<any> {
    return api.get('/water/stats', { params })
  },

  // Export water readings
  async exportReadings(params?: {
    month?: string
    year?: number
    format?: 'csv' | 'pdf' | 'excel'
  }): Promise<any> {
    return api.get('/water/export', { 
      params,
      responseType: 'blob'
    })
  },

  // Get unpaid water bills
  async getUnpaidBills(params?: {
    page?: number
    limit?: number
  }): Promise<WaterReadingResponse> {
    return api.get('/water/unpaid', { params })
  },

  // Get water consumption trends
  async getConsumptionTrends(params?: {
    startDate?: string
    endDate?: string
    apartment?: string
  }): Promise<any> {
    return api.get('/water/trends', { params })
  }
}

export default waterApi