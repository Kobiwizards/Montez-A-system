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
  moveInDate: Date
  leaseEndDate?: Date
  emergencyContact?: string
  notes?: string
  idCopyUrl?: string
  contractUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTenantRequest {
  email: string
  phone: string
  name: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rentAmount: number
  moveInDate: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
}

export interface UpdateTenantRequest {
  email?: string
  phone?: string
  name?: string
  apartment?: string
  unitType?: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rentAmount?: number
  status?: 'CURRENT' | 'OVERDUE' | 'DELINQUENT' | 'EVICTED' | 'FORMER'
  moveInDate?: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
}

export interface TenantDashboard {
  tenant: {
    id: string
    name: string
    email: string
    apartment: string
    unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
    rentAmount: number
    balance: number
    status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT' | 'EVICTED' | 'FORMER'
    moveInDate: Date
  }
  statistics: {
    totalBalance: number
    pendingPayments: number
    pendingAmount: number
    unpaidWaterBills: number
    unpaidWaterAmount: number
    activeMaintenanceRequests: number
  }
  currentMonth: {
    rentPaid: boolean
    rentPayment?: any
    waterDue: number
  }
  recentPayments: any[]
  recentReceipts: any[]
  maintenanceRequests: any[]
  waterReadings: any[]
}

export interface TenantStatistics {
  totalPaid: number
  pendingPayments: number
  totalWaterDue: number
  totalBalance: number
  paymentCount: number
  receiptCount: number
  maintenanceCount: number
}