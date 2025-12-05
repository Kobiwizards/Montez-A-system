import { WATER_RATE_PER_UNIT } from '@/lib/constants/pricing'

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
}

/**
 * Calculate water bill based on units consumed
 */
export function calculateWaterBill(units: number): number {
  return units * WATER_RATE_PER_UNIT
}

/**
 * Calculate water consumption from readings
 */
export function calculateWaterConsumption(
  previousReading: number,
  currentReading: number
): number {
  if (currentReading < previousReading) {
    throw new Error('Current reading must be greater than previous reading')
  }
  return currentReading - previousReading
}

/**
 * Calculate total water bill with readings
 */
export function calculateWaterBillFromReadings(
  previousReading: number,
  currentReading: number
): WaterBill {
  const consumption = calculateWaterConsumption(previousReading, currentReading)
  const amount = calculateWaterBill(consumption)
  
  return {
    units: consumption,
    rate: WATER_RATE_PER_UNIT,
    amount,
    previousReading,
    currentReading,
    consumption
  }
}

/**
 * Calculate water bill summary for multiple apartments
 */
export function calculateWaterBillSummary(
  bills: Array<{ apartment: string; units: number; amount: number }>
): WaterBillSummary {
  const totalUnits = bills.reduce((sum, bill) => sum + bill.units, 0)
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0)
  const averageConsumption = bills.length > 0 ? totalUnits / bills.length : 0
  
  const sortedBills = [...bills].sort((a, b) => b.units - a.units)
  const highestConsumer = sortedBills[0]?.apartment || 'N/A'
  const lowestConsumer = sortedBills[sortedBills.length - 1]?.apartment || 'N/A'
  
  return {
    totalUnits,
    totalAmount,
    averageConsumption,
    highestConsumer,
    lowestConsumer
  }
}

/**
 * Estimate water bill based on apartment type and occupancy
 */
export function estimateWaterBill(
  apartmentType: 'ONE_BEDROOM' | 'TWO_BEDROOM',
  occupancy: number,
  season: 'DRY' | 'WET' = 'DRY'
): number {
  // Base consumption per person
  let baseUnits = occupancy * 4 // 4 units per person per month
  
  // Adjust for apartment type
  if (apartmentType === 'TWO_BEDROOM') {
    baseUnits *= 1.2 // 20% more for 2-bedroom
  }
  
  // Adjust for season
  if (season === 'WET') {
    baseUnits *= 0.8 // 20% less in wet season
  }
  
  return calculateWaterBill(baseUnits)
}