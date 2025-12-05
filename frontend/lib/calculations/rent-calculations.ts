import { MONTEZ_A_APARTMENTS } from '@/lib/constants/apartments'

export interface RentCalculation {
  apartment: string
  type: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  expectedRent: number
  actualRent: number
  difference: number
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING'
}

export interface MonthlyRentSummary {
  totalExpected: number
  totalCollected: number
  collectionRate: number
  pendingAmount: number
  overdueAmount: number
}

/**
 * Calculate expected monthly rent for Montez A
 */
export function calculateExpectedMonthlyRent(): number {
  return MONTEZ_A_APARTMENTS.reduce((total, apartment) => {
    return total + apartment.rent
  }, 0)
}

/**
 * Calculate rent for specific apartments
 */
export function calculateRentForApartments(apartmentNumbers: string[]): RentCalculation[] {
  return apartmentNumbers.map(aptNumber => {
    const apartment = MONTEZ_A_APARTMENTS.find(apt => apt.number === aptNumber)
    if (!apartment) {
      throw new Error(`Apartment ${aptNumber} not found`)
    }
    
    // Mock data - in real app, fetch from database
    const actualRent = apartment.rent // Default to full payment
    const status: RentCalculation['status'] = 'PAID'
    
    return {
      apartment: aptNumber,
      type: apartment.type,
      expectedRent: apartment.rent,
      actualRent,
      difference: apartment.rent - actualRent,
      status
    }
  })
}

/**
 * Calculate monthly rent summary
 */
export function calculateMonthlyRentSummary(
  payments: Array<{ apartment: string; amount: number; status: string }>
): MonthlyRentSummary {
  const totalExpected = calculateExpectedMonthlyRent()
  const totalCollected = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0)
  
  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, payment) => sum + payment.amount, 0)
  
  const overdueAmount = payments
    .filter(p => p.status === 'OVERDUE')
    .reduce((sum, payment) => sum + payment.amount, 0)
  
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0
  
  return {
    totalExpected,
    totalCollected,
    collectionRate,
    pendingAmount,
    overdueAmount
  }
}

/**
 * Calculate late fees
 */
export function calculateLateFee(
  baseAmount: number,
  daysLate: number,
  dailyRate: number = 0.01 // 1% per day
): number {
  if (daysLate <= 0) return 0
  return baseAmount * dailyRate * daysLate
}

/**
 * Calculate prorated rent for partial months
 */
export function calculateProratedRent(
  dailyRate: number,
  daysOccupied: number,
  gracePeriodDays: number = 5
): number {
  return dailyRate * Math.max(0, daysOccupied - gracePeriodDays)
}