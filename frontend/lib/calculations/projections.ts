import { calculateExpectedMonthlyRent } from './rent-calculations'
import { MONTEZ_A_APARTMENTS } from '@/lib/constants/apartments'

export interface FinancialProjection {
  month: string
  projectedRevenue: number
  projectedExpenses: number
  projectedProfit: number
  occupancyRate: number
  collectionRate: number
}

export interface CashFlowProjection {
  date: string
  inflows: number
  outflows: number
  netCashFlow: number
  cumulativeBalance: number
}

export interface GrowthProjection {
  year: number
  revenue: number
  expenses: number
  profit: number
  occupancyRate: number
  unitCount: number
}

/**
 * Project monthly financials
 */
export function projectMonthlyFinancials(
  historicalData: Array<{
    month: string
    revenue: number
    expenses: number
    occupancyRate: number
    collectionRate: number
  }>,
  monthsToProject: number = 12,
  growthRate: number = 0.02 // 2% monthly growth
): FinancialProjection[] {
  if (historicalData.length === 0) {
    // Return baseline projections if no historical data
    return Array.from({ length: monthsToProject }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() + i + 1)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const baseRevenue = calculateExpectedMonthlyRent()
      const projectedRevenue = baseRevenue * Math.pow(1 + growthRate, i)
      const projectedExpenses = projectedRevenue * 0.3 // Assuming 30% expense ratio
      
      return {
        month,
        projectedRevenue,
        projectedExpenses,
        projectedProfit: projectedRevenue - projectedExpenses,
        occupancyRate: 95, // Base occupancy rate
        collectionRate: 98 // Base collection rate
      }
    })
  }
  
  // Use last data point as base
  const lastData = historicalData[historicalData.length - 1]
  const projections: FinancialProjection[] = []
  
  for (let i = 1; i <= monthsToProject; i++) {
    const date = new Date(lastData.month + '-01')
    date.setMonth(date.getMonth() + i)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const growthMultiplier = Math.pow(1 + growthRate, i)
    
    const projectedRevenue = lastData.revenue * growthMultiplier
    const projectedExpenses = lastData.expenses * growthMultiplier
    const projectedProfit = projectedRevenue - projectedExpenses
    
    // Slight improvements in occupancy and collection rates
    const occupancyRate = Math.min(100, lastData.occupancyRate + (i * 0.5))
    const collectionRate = Math.min(100, lastData.collectionRate + (i * 0.3))
    
    projections.push({
      month,
      projectedRevenue,
      projectedExpenses,
      projectedProfit,
      occupancyRate,
      collectionRate
    })
  }
  
  return projections
}

/**
 * Project cash flow
 */
export function projectCashFlow(
  startingBalance: number,
  regularInflows: number,
  regularOutflows: number,
  months: number = 12,
  inflowGrowth: number = 0.02,
  outflowGrowth: number = 0.015
): CashFlowProjection[] {
  const projections: CashFlowProjection[] = []
  let cumulativeBalance = startingBalance
  
  const today = new Date()
  
  for (let i = 0; i < months; i++) {
    const date = new Date(today)
    date.setMonth(date.getMonth() + i)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const inflows = regularInflows * Math.pow(1 + inflowGrowth, i)
    const outflows = regularOutflows * Math.pow(1 + outflowGrowth, i)
    const netCashFlow = inflows - outflows
    
    cumulativeBalance += netCashFlow
    
    projections.push({
      date: monthStr,
      inflows,
      outflows,
      netCashFlow,
      cumulativeBalance
    })
  }
  
  return projections
}

/**
 * Project long-term growth (5-year projection)
 */
export function projectLongTermGrowth(
  currentRevenue: number,
  currentExpenses: number,
  currentOccupancy: number,
  years: number = 5,
  revenueGrowthRate: number = 0.15, // 15% annual revenue growth
  expenseGrowthRate: number = 0.12, // 12% annual expense growth
  occupancyGrowthRate: number = 0.02 // 2% annual occupancy improvement
): GrowthProjection[] {
  const projections: GrowthProjection[] = []
  const currentYear = new Date().getFullYear()
  
  for (let i = 0; i < years; i++) {
    const year = currentYear + i
    
    const revenue = currentRevenue * Math.pow(1 + revenueGrowthRate, i + 1)
    const expenses = currentExpenses * Math.pow(1 + expenseGrowthRate, i + 1)
    const profit = revenue - expenses
    const occupancyRate = Math.min(100, currentOccupancy * Math.pow(1 + occupancyGrowthRate, i + 1))
    
    // Assume adding 2 units per year (if expanding)
    const unitCount = MONTEZ_A_APARTMENTS.length + (i * 2)
    
    projections.push({
      year,
      revenue,
      expenses,
      profit,
      occupancyRate,
      unitCount
    })
  }
  
  return projections
}

/**
 * Calculate break-even analysis
 */
export interface BreakEvenAnalysis {
  monthlyFixedCosts: number
  variableCostPerUnit: number
  pricePerUnit: number
  breakEvenUnits: number
  breakEvenRevenue: number
  marginOfSafety: number
}

export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number,
  currentUnits: number,
  currentRevenue: number
): BreakEvenAnalysis {
  if (pricePerUnit <= variableCostPerUnit) {
    throw new Error('Price must be greater than variable cost per unit')
  }
  
  const contributionMargin = pricePerUnit - variableCostPerUnit
  const breakEvenUnits = fixedCosts / contributionMargin
  const breakEvenRevenue = breakEvenUnits * pricePerUnit
  const marginOfSafety = currentUnits > 0 
    ? ((currentUnits - breakEvenUnits) / currentUnits) * 100 
    : 0
  
  return {
    monthlyFixedCosts: fixedCosts,
    variableCostPerUnit,
    pricePerUnit,
    breakEvenUnits,
    breakEvenRevenue,
    marginOfSafety
  }
}

/**
 * Calculate ROI (Return on Investment)
 */
export function calculateROI(
  initialInvestment: number,
  annualNetProfit: number,
  years: number = 5
): {
  totalReturn: number
  annualizedROI: number
  paybackPeriod: number // in years
} {
  const totalReturn = annualNetProfit * years
  const annualizedROI = (totalReturn / initialInvestment) * 100 / years
  const paybackPeriod = initialInvestment / annualNetProfit
  
  return {
    totalReturn,
    annualizedROI,
    paybackPeriod
  }
}

/**
 * Calculate NPV (Net Present Value)
 */
export function calculateNPV(
  initialInvestment: number,
  cashFlows: number[],
  discountRate: number = 0.1 // 10% discount rate
): number {
  let npv = -initialInvestment
  
  cashFlows.forEach((cashFlow, index) => {
    const year = index + 1
    const discountedCashFlow = cashFlow / Math.pow(1 + discountRate, year)
    npv += discountedCashFlow
  })
  
  return npv
}