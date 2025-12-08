import { api } from './client'

export interface Payment {
  id: string
  tenantId: string
  type: 'RENT' | 'WATER' | 'OTHER'
  method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK'
  amount: number
  currency: string
  month: string
  year: number
  description?: string
  transactionCode?: string
  caretakerName?: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELLED'
  screenshotUrls: string[]
  verifiedAt?: string
  verifiedBy?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  tenant?: {
    id: string
    name: string
    apartment: string
    email: string
  }
  receipts?: Array<{
    id: string
    receiptNumber: string
    filePath: string
    generatedAt: string
    downloaded: boolean
    downloadedAt?: string
    downloadCount: number
  }>
}

export interface CreatePaymentRequest {
  type: 'RENT' | 'WATER' | 'OTHER'
  method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK'
  amount: number
  month: string
  description?: string
  transactionCode?: string
  caretakerName?: string
  screenshots: File[]
}

export interface VerifyPaymentRequest {
  status: 'VERIFIED' | 'REJECTED'
  adminNotes?: string
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

class PaymentAPI {
  // Submit new payment (with file upload)
  async createPayment(data: CreatePaymentRequest): Promise<{ success: boolean; message: string; data: Payment }> {
    const formData = new FormData()
    
    // Add all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'screenshots') {
        // Handle file uploads
        data.screenshots.forEach((file, index) => {
          formData.append('screenshots', file)
        })
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    return api.upload('/payments', formData)
  }

  // Get all payments (admin)
  async getAllPayments(params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    month?: string
    tenantId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Payment>> {
    return api.get('/payments', { params })
  }

  // Get pending payments (admin)
  async getPendingPayments(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Payment>> {
    return api.get('/payments/pending', { params })
  }

  // Get payment by ID
  async getPaymentById(id: string): Promise<{ success: boolean; data: Payment }> {
    return api.get(`/payments/${id}`)
  }

  // Verify/reject payment (admin)
  async verifyPayment(id: string, data: VerifyPaymentRequest): Promise<{ success: boolean; message: string; data: Payment }> {
    return api.put(`/payments/${id}/verify`, data)
  }

  // Delete payment (admin)
  async deletePayment(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/payments/${id}`)
  }

  // Get tenant's payment history
  async getTenantPayments(params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    month?: string
  }): Promise<PaginatedResponse<Payment>> {
    return api.get('/payments/me/history', { params })
  }
}

export const paymentApi = new PaymentAPI()
