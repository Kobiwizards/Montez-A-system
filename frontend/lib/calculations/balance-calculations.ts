export interface TenantBalance {
  tenantId: string
  apartment: string
  rentBalance: number
  waterBalance: number
  otherBalance: number
  totalBalance: number
  lastPaymentDate?: string
  nextPaymentDue: string
  status: 'CURRENT' | 'OVERDUE' | 'DELINQUENT'
}

export interface BalanceSummary {
  totalOutstanding: number
  totalRentDue: number
  totalWaterDue: number
  totalOtherDue: number
  averageBalancePerTenant: number
  tenantsInArrears: number
}

/**
 * Calculate tenant balance
 */
export function calculateTenantBalance(
  rentDue: number,
  rentPaid: number,
  waterDue: number,
  waterPaid: number,
  otherDue: number = 0,
  otherPaid: number = 0
): number {
  return (rentDue + waterDue + otherDue) - (rentPaid + waterPaid + otherPaid)
}

/**
 * Calculate balance summary for all tenants
 */
export function calculateBalanceSummary(
  tenantBalances: TenantBalance[]
): BalanceSummary {
  const totalOutstanding = tenantBalances.reduce((sum, tenant) => sum + tenant.totalBalance, 0)
  const totalRentDue = tenantBalances.reduce((sum, tenant) => sum + tenant.rentBalance, 0)
  const totalWaterDue = tenantBalances.reduce((sum, tenant) => sum + tenant.waterBalance, 0)
  const totalOtherDue = tenantBalances.reduce((sum, tenant) => sum + tenant.otherBalance, 0)
  
  const tenantsInArrears = tenantBalances.filter(tenant => 
    tenant.totalBalance > 0 && tenant.status !== 'CURRENT'
  ).length
  
  const averageBalancePerTenant = tenantBalances.length > 0 
    ? totalOutstanding / tenantBalances.length 
    : 0
  
  return {
    totalOutstanding,
    totalRentDue,
    totalWaterDue,
    totalOtherDue,
    averageBalancePerTenant,
    tenantsInArrears
  }
}

/**
 * Calculate payment status based on balance and due date
 */
export function calculatePaymentStatus(
  balance: number,
  dueDate: string,
  gracePeriodDays: number = 5
): TenantBalance['status'] {
  const today = new Date()
  const due = new Date(dueDate)
  
  if (balance <= 0) {
    return 'CURRENT'
  }
  
  const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysOverdue <= gracePeriodDays) {
    return 'CURRENT' // Still in grace period
  } else if (daysOverdue <= 30) {
    return 'OVERDUE'
  } else {
    return 'DELINQUENT'
  }
}

/**
 * Calculate late fees for overdue balance
 */
export function calculateLateFees(
  principal: number,
  daysOverdue: number,
  dailyLateFeeRate: number = 0.005, // 0.5% per day
  maxLateFeeRate: number = 0.2 // Max 20%
): number {
  if (daysOverdue <= 0) return 0
  
  const calculatedFee = principal * dailyLateFeeRate * daysOverdue
  const maxFee = principal * maxLateFeeRate
  
  return Math.min(calculatedFee, maxFee)
}

/**
 * Calculate payment allocation (how payments are applied to different balances)
 */
export interface PaymentAllocation {
  rent: number
  water: number
  other: number
  lateFees: number
}

export function allocatePayment(
  paymentAmount: number,
  balances: {
    rentBalance: number
    waterBalance: number
    otherBalance: number
    lateFees: number
  }
): PaymentAllocation {
  const allocation: PaymentAllocation = {
    rent: 0,
    water: 0,
    other: 0,
    lateFees: 0
  }
  
  let remaining = paymentAmount
  
  // 1. Pay late fees first
  allocation.lateFees = Math.min(balances.lateFees, remaining)
  remaining -= allocation.lateFees
  
  // 2. Pay rent
  allocation.rent = Math.min(balances.rentBalance, remaining)
  remaining -= allocation.rent
  
  // 3. Pay water
  allocation.water = Math.min(balances.waterBalance, remaining)
  remaining -= allocation.water
  
  // 4. Pay other balances
  allocation.other = Math.min(balances.otherBalance, remaining)
  
  return allocation
}

/**
 * Calculate projected balance after payment
 */
export function calculateProjectedBalance(
  currentBalance: number,
  regularPaymentAmount: number,
  months: number = 12,
  monthlyIncrease: number = 0 // Percentage increase per month
): number[] {
  const projections: number[] = []
  let balance = currentBalance
  
  for (let i = 0; i < months; i++) {
    const payment = regularPaymentAmount * (1 + monthlyIncrease * i)
    balance = Math.max(0, balance - payment)
    projections.push(balance)
  }
  
  return projections
}