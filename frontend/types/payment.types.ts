export type PaymentType = 'RENT' | 'WATER' | 'MAINTENANCE' | 'OTHER'
export type PaymentMethod = 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK'
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELLED'

export interface Payment {
  id: string
  tenantId: string
  type: PaymentType
  method: PaymentMethod
  amount: number
  currency: string
  month: string // YYYY-MM
  year: number
  description?: string
  transactionCode?: string
  caretakerName?: string
  status: PaymentStatus
  files: string[]
  verifiedAt?: Date
  verifiedBy?: string
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentCreateDTO {
  type: PaymentType
  method: PaymentMethod
  amount: number
  month: string
  description?: string
  transactionCode?: string
  caretakerName?: string
  files: File[]
}

export interface PaymentUpdateDTO {
  status: PaymentStatus
  adminNotes?: string
}

export interface PaymentFilter {
  status?: PaymentStatus
  type?: PaymentType
  month?: string
  year?: number
  tenantId?: string
  page?: number
  limit?: number
}