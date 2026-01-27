import { api } from './client' // CHANGED from './index'

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
  async getAllReadings(params?: {
    page?: number
    limit?: number
    month?: string
    year?: number
    paid?: boolean
  }): Promise<WaterReadingResponse> {
    return api.get('/water/readings', { params })
  },

  async getTenantReadings(tenantId: string, params?: {
    page?: number
    limit?: number
  }): Promise<WaterReadingResponse> {
    return api.get(`/water/tenants/${tenantId}/readings`, { params })
  },

  async getReadingById(id: string): Promise<WaterReadingResponse> {
    return api.get(`/water/readings/${id}`)
  },

  async createReading(data: WaterReadingRequest): Promise<WaterReadingResponse> {
    return api.post('/water/readings', data)
  },

  async updateReading(id: string, data: Partial<WaterReadingRequest>): Promise<WaterReadingResponse> {
    return api.put(`/water/readings/${id}`, data)
  },

  async deleteReading(id: string): Promise<WaterReadingResponse> {
    return api.delete(`/water/readings/${id}`)
  },

  async markAsPaid(id: string, paymentId: string): Promise<WaterReadingResponse> {
    return api.patch(`/water/readings/${id}/pay`, { paymentId })
  },

  async getWaterStats(params?: {
    month?: string
    year?: number
  }): Promise<any> {
    return api.get('/water/stats', { params })
  },

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

  async getUnpaidBills(params?: {
    page?: number
    limit?: number
  }): Promise<WaterReadingResponse> {
    return api.get('/water/unpaid', { params })
  },

  async getConsumptionTrends(params?: {
    startDate?: string
    endDate?: string
    apartment?: string
  }): Promise<any> {
    return api.get('/water/trends', { params })
  }
}

export default waterApi