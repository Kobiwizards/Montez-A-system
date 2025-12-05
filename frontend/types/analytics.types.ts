export interface OccupancyMetrics {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  occupancyRate: number
  vacancyRate: number
  averageTenure: number
  upcomingVacancies: number
}

export interface FinancialMetrics {
  totalRentDue: number
  totalRentCollected: number
  totalWaterDue: number
  totalWaterCollected: number
  totalOtherDue: number
  totalOtherCollected: number
  collectionRate: number
  pendingPayments: number
  overduePayments: number
  averagePaymentTime: number
}

export interface MonthlyReport {
  month: string
  revenue: number
  expenses: number
  profit: number
  occupancyRate: number
  collectionRate: number
  newTenants: number
  departedTenants: number
}

export interface AnalyticsSnapshot {
  date: Date
  occupancy: OccupancyMetrics
  financial: FinancialMetrics
  topPerformingUnits: string[]
  issues: string[]
}

export interface TrendData {
  labels: string[]
  data: number[]
  trend: 'UP' | 'DOWN' | 'STABLE'
  percentageChange: number
}