export interface WaterReading {
  id: string
  tenantId: string
  previousReading: number
  currentReading: number
  units: number
  rate: number
  amount: number
  month: string
  year: number
  paid: boolean
  paymentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface WaterReadingWithTenant extends WaterReading {
  tenant: {
    id: string
    name: string
    apartment: string
  }
}

export interface WaterConsumptionReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalUnits: number
    totalAmount: number
    paidUnits: number
    paidAmount: number
    paymentRate: number
    averageUnitsPerMonth: number
    averageAmountPerMonth: number
  }
  monthlyData: Array<{
    month: string
    totalUnits: number
    totalAmount: number
    paidUnits: number
    paidAmount: number
    readings: Array<{
      apartment: string
      tenantName: string
      units: number
      amount: number
      paid: boolean
    }>
  }>
  apartmentRanking: Array<{
    apartment: string
    units: number
  }>
  extremes: {
    highestConsumer?: {
      apartment: string
      units: number
    }
    lowestConsumer?: {
      apartment: string
      units: number
    }
  }
}
