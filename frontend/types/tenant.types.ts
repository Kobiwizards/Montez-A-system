export type UserRole = 'ADMIN' | 'TENANT'
export type UnitType = 'ONE_BEDROOM' | 'TWO_BEDROOM'
export type TenantStatus = 'CURRENT' | 'OVERDUE' | 'DELINQUENT' | 'EVICTED' | 'FORMER'

export interface Tenant {
  id: string
  email: string
  phone: string
  name: string
  role: UserRole
  apartment: string
  unitType: UnitType
  rentAmount: number
  waterRate: number
  balance: number
  status: TenantStatus
  moveInDate: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopyUrl?: string
  contractUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTenantData {
  email: string
  phone: string
  name: string
  password: string
  apartment: string
  unitType: UnitType
  rentAmount: number
  waterRate?: number
  moveInDate: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopy?: File
  contract?: File
}

export interface UpdateTenantData {
  email?: string
  phone?: string
  name?: string
  apartment?: string
  unitType?: UnitType
  rentAmount?: number
  waterRate?: number
  balance?: number
  status?: TenantStatus
  moveInDate?: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopy?: File
  contract?: File
}

export interface TenantFilters {
  status?: TenantStatus
  apartment?: string
  search?: string
  page?: number
  limit?: number
}

export interface TenantStats {
  total: number
  current: number
  overdue: number
  delinquent: number
  totalOutstanding: number
  averageRent: number
  occupancyRate: number
}
