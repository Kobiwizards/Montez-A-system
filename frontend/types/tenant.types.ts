export type TenantStatus = 'CURRENT' | 'OVERDUE' | 'DELINQUENT' | 'EVICTED' | 'FORMER'
export type UnitType = 'ONE_BEDROOM' | 'TWO_BEDROOM'

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  apartment: string
  unitType: UnitType
  rentAmount: number
  waterRate: number
  balance: number
  status: TenantStatus
  moveInDate: Date
  leaseEndDate?: Date
  emergencyContact?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface TenantCreateDTO {
  name: string
  email: string
  phone: string
  apartment: string
  unitType: UnitType
  rentAmount: number
  moveInDate: Date
  emergencyContact?: string
  notes?: string
}

export interface TenantUpdateDTO {
  name?: string
  email?: string
  phone?: string
  apartment?: string
  unitType?: UnitType
  rentAmount?: number
  status?: TenantStatus
  moveInDate?: Date
  leaseEndDate?: Date
  emergencyContact?: string
  notes?: string
}

export interface TenantStats {
  totalTenants: number
  currentTenants: number
  overdueTenants: number
  delinquentTenants: number
  averageBalance: number
  totalOutstanding: number
}