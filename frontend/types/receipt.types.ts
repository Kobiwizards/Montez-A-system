export interface Receipt {
  id: string
  receiptNumber: string
  paymentId: string
  filePath: string
  generatedAt: string
  downloaded: boolean
  downloadedAt?: string
  downloadCount: number
  payment?: {
    id: string
    type: 'RENT' | 'WATER' | 'MAINTENANCE' | 'OTHER'
    amount: number
    month: string
    method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK'
    createdAt: string
    tenant?: {
      name: string
      apartment: string
      email: string
      phone: string
    }
  }
}

export interface ReceiptData {
  receiptNumber: string
  tenantName: string
  apartment: string
  tenantEmail: string
  tenantPhone: string
  paymentType: string
  paymentMethod: string
  amount: number
  month: string
  datePaid: string
  transactionCode?: string
  caretakerName?: string
  waterUnits?: number
  waterRate?: number
  waterAmount?: number
  totalAmount: number
  generatedAt: string
}

export interface ReceiptFilters {
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ReceiptSummary {
  totalReceipts: number
  totalAmount: number
  averageAmount: number
  recentReceipts: Receipt[]
}