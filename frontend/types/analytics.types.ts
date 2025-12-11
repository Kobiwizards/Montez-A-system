export interface AnalyticsData {
  summary: {
    totalTenants: number
    totalUnits: number
    occupancyRate: number
    totalRentDue: number
    totalRentPaid: number
    totalWaterDue: number
    totalWaterPaid: number
    pendingPayments: number
    verifiedPayments: number
  }
  monthlyTrends: {
    month: string
    rentCollected: number
    rentDue: number
    waterCollected: number
    waterDue: number
    newTenants: number
    vacancies: number
  }[]
  tenantStatus: {
    current: number
    overdue: number
    delinquent: number
    evicted: number
    former: number
  }
  unitStatus: {
    occupied: number
    vacant: number
    maintenance: number
  }
}

export interface OccupancyData {
  occupancyRate: number
  vacancyRate: number
  monthlyTrend: {
    month: string
    occupancyRate: number
    vacancyRate: number
  }[]
  byUnitType: {
    unitType: string
    totalUnits: number
    occupiedUnits: number
    vacancyRate: number
  }[]
  tenantRetention: {
    month: string
    retainedTenants: number
    newTenants: number
    churnRate: number
  }[]
}

export interface FinancialData {
  revenue: {
    total: number
    rent: number
    water: number
    other: number
  }
  expenses: {
    total: number
    maintenance: number
    utilities: number
    staff: number
    other: number
  }
  netIncome: number
  monthlyTrend: {
    month: string
    revenue: number
    expenses: number
    netIncome: number
  }[]
  paymentStatus: {
    paid: number
    pending: number
    overdue: number
    delinquent: number
  }
  outstandingBalances: {
    tenantName: string
    apartment: string
    balance: number
    status: string
  }[]
}

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  unitType?: string
  status?: string
  apartment?: string
}

export type ExportFormat = 'csv' | 'pdf' | 'excel'
