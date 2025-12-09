// Re-export all types
export * from './auth.types'
export * from './tenant.types'
export * from './payment.types'
export * from './receipt.types'
export * from './analytics.types'
export * from './water.types'
export * from './maintenance.types'
export * from './notification.types'

// Common types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: any[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface FileUpload {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}