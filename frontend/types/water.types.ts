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
  createdAt: string
  updatedAt: string
  tenant?: {
    name: string
    apartment: string
    email: string
  }
  payment?: {
    id: string
    status: string
    createdAt: string
  }
}

export interface WaterBill {
  units: number
  rate: number
  amount: number
  previousReading: number
  currentReading: number
  consumption: number
}

export interface WaterBillSummary {
  totalUnits: number
  totalAmount: number
  averageConsumption: number
  highestConsumer: string
  lowestConsumer: string
  paymentRate: number
}

export interface WaterReadingCreateData {
  previousReading: number
  currentReading: number
  month: string
}

export interface WaterReadingUpdateData {
  previousReading?: number
  currentReading?: number
}

export interface WaterConsumptionReport {
  period: {
    start: string
    end: string
  }
  summary: WaterBillSummary
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