import { MONTEZ_A_APARTMENTS, TOTAL_UNITS } from '@/lib/constants/apartments'

export interface OccupancyData {
  apartment: string
  status: 'OCCUPIED' | 'VACANT' | 'MAINTENANCE'
  tenantName?: string
  moveInDate?: string
  leaseEndDate?: string
}

export interface OccupancyMetrics {
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  occupancyRate: number
  vacancyRate: number
  averageTenure: number // in months
  upcomingVacancies: number
}

export interface FloorOccupancy {
  floor: number
  totalUnits: number
  occupiedUnits: number
  occupancyRate: number
}

/**
 * Calculate occupancy rate
 */
export function calculateOccupancyRate(occupiedUnits: number): number {
  if (TOTAL_UNITS === 0) return 0
  return (occupiedUnits / TOTAL_UNITS) * 100
}

/**
 * Calculate vacancy rate
 */
export function calculateVacancyRate(vacantUnits: number): number {
  if (TOTAL_UNITS === 0) return 0
  return (vacantUnits / TOTAL_UNITS) * 100
}

/**
 * Calculate occupancy metrics
 */
export function calculateOccupancyMetrics(
  occupancyData: OccupancyData[]
): OccupancyMetrics {
  const occupiedUnits = occupancyData.filter(unit => unit.status === 'OCCUPIED').length
  const vacantUnits = occupancyData.filter(unit => unit.status === 'VACANT').length
  const maintenanceUnits = occupancyData.filter(unit => unit.status === 'MAINTENANCE').length
  
  const occupancyRate = calculateOccupancyRate(occupiedUnits)
  const vacancyRate = calculateVacancyRate(vacantUnits)
  
  // Calculate average tenure (in months)
  const occupiedApartments = occupancyData.filter(unit => unit.status === 'OCCUPIED')
  const totalTenure = occupiedApartments.reduce((sum, unit) => {
    if (unit.moveInDate) {
      const moveIn = new Date(unit.moveInDate)
      const now = new Date()
      const months = (now.getFullYear() - moveIn.getFullYear()) * 12 + 
                    (now.getMonth() - moveIn.getMonth())
      return sum + Math.max(0, months)
    }
    return sum
  }, 0)
  
  const averageTenure = occupiedApartments.length > 0 
    ? totalTenure / occupiedApartments.length 
    : 0
  
  // Count upcoming vacancies (within next 30 days)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const upcomingVacancies = occupiedApartments.filter(unit => {
    if (unit.leaseEndDate) {
      const leaseEnd = new Date(unit.leaseEndDate)
      return leaseEnd <= thirtyDaysFromNow && leaseEnd >= now
    }
    return false
  }).length
  
  return {
    occupiedUnits,
    vacantUnits,
    maintenanceUnits,
    occupancyRate,
    vacancyRate,
    averageTenure,
    upcomingVacancies
  }
}

/**
 * Calculate floor-wise occupancy
 */
export function calculateFloorOccupancy(
  occupancyData: OccupancyData[]
): FloorOccupancy[] {
  const floors = [1, 2, 3, 4, 5, 6] // Montez A floors
  const floorOccupancy: FloorOccupancy[] = []
  
  floors.forEach(floor => {
    const floorApartments = MONTEZ_A_APARTMENTS.filter(apt => apt.floor === floor)
    const floorUnits = floorApartments.length
    
    const occupiedFloorUnits = occupancyData.filter(unit => {
      const apt = MONTEZ_A_APARTMENTS.find(a => a.number === unit.apartment)
      return apt?.floor === floor && unit.status === 'OCCUPIED'
    }).length
    
    const occupancyRate = floorUnits > 0 ? (occupiedFloorUnits / floorUnits) * 100 : 0
    
    floorOccupancy.push({
      floor,
      totalUnits: floorUnits,
      occupiedUnits: occupiedFloorUnits,
      occupancyRate
    })
  })
  
  return floorOccupancy
}

/**
 * Calculate revenue per square foot (if we had area data)
 */
export function calculateRevenuePerUnit(
  totalRevenue: number,
  occupiedUnits: number
): number {
  return occupiedUnits > 0 ? totalRevenue / occupiedUnits : 0
}

/**
 * Predict occupancy trend
 */
export function predictOccupancyTrend(
  historicalData: Array<{ month: string; occupancyRate: number }>,
  monthsToPredict: number = 3
): number[] {
  if (historicalData.length < 3) {
    return new Array(monthsToPredict).fill(
      historicalData.length > 0 
        ? historicalData[historicalData.length - 1].occupancyRate 
        : 0
    )
  }
  
  // Simple linear regression for prediction
  const n = historicalData.length
  const xValues = historicalData.map((_, i) => i)
  const yValues = historicalData.map(d => d.occupancyRate)
  
  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // Predict next months
  const predictions: number[] = []
  for (let i = 0; i < monthsToPredict; i++) {
    predictions.push(slope * (n + i) + intercept)
  }
  
  return predictions.map(p => Math.max(0, Math.min(100, p))) // Clamp between 0 and 100
}