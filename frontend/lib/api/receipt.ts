import { api } from './client'

export interface Receipt {
  id: string
  receiptNumber: string
  filePath: string
  generatedAt: string
  downloaded: boolean
  downloadedAt?: string
  downloadCount: number
  payment?: {
    id: string
    type: string
    amount: number
    month: string
    method: string
    createdAt: string
    tenant?: {
      id: string
      name: string
      apartment: string
      email: string
    }
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

class ReceiptAPI {
  // Get receipt by ID
  async getReceiptById(id: string): Promise<{ success: boolean; data: Receipt }> {
    return api.get(`/receipts/${id}`)
  }

  // Download receipt file
  async downloadReceipt(id: string): Promise<Blob> {
    return api.download(`/receipts/${id}/download`)
  }

  // Generate receipt for payment (admin)
  async generateReceipt(paymentId: string): Promise<{ success: boolean; message: string; data: Receipt }> {
    return api.post(`/receipts/generate/${paymentId}`)
  }

  // Get tenant's receipts
  async getTenantReceipts(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<Receipt>> {
    return api.get('/receipts/me/history', { params })
  }

  // Get all receipts (admin)
  async getAllReceipts(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    tenantId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Receipt>> {
    return api.get('/receipts', { params })
  }

  // Delete receipt (admin)
  async deleteReceipt(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/receipts/${id}`)
  }

  // Helper to download receipt with filename
  async downloadReceiptFile(receipt: Receipt): Promise<void> {
    try {
      const blob = await this.downloadReceipt(receipt.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${receipt.receiptNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download receipt:', error)
      throw error
    }
  }
}

export const receiptApi = new ReceiptAPI()
