// Rent pricing
export const ONE_BEDROOM_RENT = 15000
export const TWO_BEDROOM_RENT = 18000

// Water rates
export const WATER_RATE_PER_UNIT = 150
export const AVERAGE_WATER_CONSUMPTION = 6 // units per month

// Late fees
export const LATE_FEE_PERCENTAGE = 5 // 5% of rent
export const GRACE_PERIOD_DAYS = 5

// Security deposit (typically 2 months rent)
export const SECURITY_DEPOSIT_MULTIPLIER = 2

// Other fees
export const MAINTENANCE_FEE = 500 // Monthly maintenance fee
export const GARBAGE_COLLECTION_FEE = 300 // Monthly garbage collection

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'MPESA', name: 'M-Pesa', description: 'Mobile money transfer' },
  { id: 'CASH', name: 'Cash', description: 'Physical cash payment' },
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', description: 'Direct bank transfer' },
  { id: 'CHECK', name: 'Check', description: 'Bank check' },
]

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', color: 'warning' },
  VERIFIED: { label: 'Verified', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
  CANCELLED: { label: 'Cancelled', color: 'muted' },
}

// Tenant statuses
export const TENANT_STATUSES = {
  CURRENT: { label: 'Current', color: 'success' },
  OVERDUE: { label: 'Overdue', color: 'warning' },
  DELINQUENT: { label: 'Delinquent', color: 'error' },
  EVICTED: { label: 'Evicted', color: 'error' },
  FORMER: { label: 'Former', color: 'muted' },
}

// Currency
export const CURRENCY = 'KES'
export const CURRENCY_SYMBOL = 'KSh'