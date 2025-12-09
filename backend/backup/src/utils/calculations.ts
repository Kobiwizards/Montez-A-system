import { config } from '../config/index'

// Montez A specific calculations
export const MONTEZ_A_UNITS = 26
export const FLOORS = 6
export const UNITS_PER_FLOOR = 4 // Except rooftop which has 2

export interface ApartmentInfo {
  number: string
  floor: number
  type: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  rent: number
}

export const MONTEZ_A_APARTMENTS: ApartmentInfo[] = [
  // Floor 1
  { number: '1A1', floor: 1, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '1A2', floor: 1, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '1B1', floor: 1, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  { number: '1B2', floor: 1, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  
  // Floor 2
  { number: '2A1', floor: 2, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '2A2', floor: 2, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '2B1', floor: 2, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  { number: '2B2', floor: 2, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  
  // Floor 3
  { number: '3A1', floor: 3, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '3A2', floor: 3, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '3B1', floor: 3, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  { number: '3B2', floor: 3, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  
  // Floor 4
  { number: '4A1', floor: 4, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '4A2', floor: 4, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '4B1', floor: 4, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  { number: '4B2', floor: 4, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  
  // Floor 5
  { number: '5A1', floor: 5, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '5A2', floor: 5, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '5B1', floor: 5, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  { number: '5B2', floor: 5, type: 'ONE_BEDROOM', rent: config.oneBedroomRent },
  
  // Rooftop (Floor 6)
  { number: '6A1', floor: 6, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
  { number: '6A2', floor: 6, type: 'TWO_BEDROOM', rent: config.twoBedroomRent },
]

// Financial calculations
export function calculateWaterBill(units: number): number {
  return units * config.waterRatePerUnit
}

export function calculateOccupancyRate(occupiedUnits: number): number {
  return (occupiedUnits / MONTEZ_A_UNITS) * 100
}

export function calculateMonthlyRentProjection(): number {
  return MONTEZ_A_APARTMENTS.reduce((total, apt) => total + apt.rent, 0)
}

export function calculateLateFee(amount: number, daysLate: number): number {
  const dailyRate = 0.005 // 0.5% per day
  const maxFee = amount * 0.2 // Max 20%
  const calculatedFee = amount * dailyRate * daysLate
  return Math.min(calculatedFee, maxFee)
}

export function calculateProratedRent(dailyRate: number, daysOccupied: number): number {
  return dailyRate * daysOccupied
}

export function calculateTotalRevenue(
  rentPayments: number,
  waterPayments: number,
  otherPayments: number = 0
): number {
  return rentPayments + waterPayments + otherPayments
}

export function calculateCollectionRate(amountCollected: number, amountDue: number): number {
  if (amountDue === 0) return 100
  return (amountCollected / amountDue) * 100
}

export function calculateAverageTenancyDuration(moveInDates: Date[]): number {
  if (moveInDates.length === 0) return 0
  
  const now = new Date()
  const totalMonths = moveInDates.reduce((sum, date) => {
    const moveIn = new Date(date)
    const months = (now.getFullYear() - moveIn.getFullYear()) * 12 + 
                  (now.getMonth() - moveIn.getMonth())
    return sum + Math.max(0, months)
  }, 0)
  
  return totalMonths / moveInDates.length
}

export function calculateWaterConsumptionTrend(readings: { month: string; units: number }[]): {
  trend: 'INCREASING' | 'DECREASING' | 'STABLE'
  percentageChange: number
} {
  if (readings.length < 2) {
    return { trend: 'STABLE', percentageChange: 0 }
  }

  const sortedReadings = [...readings].sort((a, b) => 
    a.month.localeCompare(b.month)
  )

  const first = sortedReadings[0]
  const last = sortedReadings[sortedReadings.length - 1]

  const percentageChange = ((last.units - first.units) / first.units) * 100

  if (percentageChange > 10) return { trend: 'INCREASING', percentageChange }
  if (percentageChange < -10) return { trend: 'DECREASING', percentageChange }
  return { trend: 'STABLE', percentageChange }
}

export function generateFinancialProjection(
  currentRevenue: number,
  growthRate: number,
  months: number
): number[] {
  const projections: number[] = []
  let revenue = currentRevenue

  for (let i = 0; i < months; i++) {
    revenue *= (1 + growthRate)
    projections.push(revenue)
  }

  return projections
}

export function calculateBreakEvenPoint(
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number
): number {
  if (pricePerUnit <= variableCostPerUnit) {
    throw new Error('Price must be greater than variable cost per unit')
  }
  
  return fixedCosts / (pricePerUnit - variableCostPerUnit)
}

export function calculateNetOperatingIncome(
  grossIncome: number,
  operatingExpenses: number,
  vacancyRate: number
): number {
  const effectiveGrossIncome = grossIncome * (1 - vacancyRate / 100)
  return effectiveGrossIncome - operatingExpenses
}

export function calculateCashOnCashReturn(
  annualCashFlow: number,
  totalInvestment: number
): number {
  return (annualCashFlow / totalInvestment) * 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getFloorOccupancy(tenants: { apartment: string }[]): Map<number, number> {
  const floorOccupancy = new Map<number, number>()
  
  // Initialize all floors
  for (let floor = 1; floor <= FLOORS; floor++) {
    floorOccupancy.set(floor, 0)
  }
  
  // Count tenants per floor
  tenants.forEach(tenant => {
    const apartment = MONTEZ_A_APARTMENTS.find(a => a.number === tenant.apartment)
    if (apartment) {
      floorOccupancy.set(apartment.floor, (floorOccupancy.get(apartment.floor) || 0) + 1)
    }
  })
  
  return floorOccupancy
}

export function getUnitTypeOccupancy(tenants: { apartment: string }[]): {
  ONE_BEDROOM: number
  TWO_BEDROOM: number
} {
  const occupancy = {
    ONE_BEDROOM: 0,
    TWO_BEDROOM: 0,
  }
  
  tenants.forEach(tenant => {
    const apartment = MONTEZ_A_APARTMENTS.find(a => a.number === tenant.apartment)
    if (apartment) {
      occupancy[apartment.type]++
    }
  })
  
  return occupancy
}