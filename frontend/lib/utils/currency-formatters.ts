/**
 * Format currency to Kenyan Shillings (compatible with existing formatCurrency)
 */
export const formatCurrencyKES = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format currency with decimals
 */
export const formatCurrencyWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-KE').format(num)
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0
  return (part / total) * 100
}

/**
 * Format large numbers (e.g., 1.5K, 2.3M)
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return formatNumber(num)
}

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyStr: string): number => {
  const cleaned = currencyStr.replace(/[^0-9.-]+/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Calculate water bill (compatible with existing calculateWaterBill)
 */
export const calculateWaterBillWithRate = (units: number, rate: number = 150): number => {
  return Math.max(0, units * rate)
}

/**
 * Calculate rent with penalties
 */
export const calculateRentWithPenalty = (
  baseRent: number,
  daysLate: number,
  penaltyRate: number = 0.02 // 2% per day
): number => {
  const penalty = daysLate > 0 ? baseRent * penaltyRate * daysLate : 0
  return baseRent + penalty
}

/**
 * Format balance status
 */
export const formatBalanceStatus = (balance: number): {
  text: string
  color: string
  variant: 'success' | 'warning' | 'error' | 'default'
} => {
  if (balance === 0) {
    return { text: 'Paid', color: 'text-green-500', variant: 'success' }
  } else if (balance > 0) {
    return { text: `Owed: ${formatCurrencyKES(balance)}`, color: 'text-amber-500', variant: 'warning' }
  } else {
    return { text: `Credit: ${formatCurrencyKES(Math.abs(balance))}`, color: 'text-blue-500', variant: 'default' }
  }
}

/**
 * Calculate total from array of amounts
 */
export const calculateTotal = (amounts: number[]): number => {
  return amounts.reduce((sum, amount) => sum + amount, 0)
}

/**
 * Format amount with sign
 */
export const formatAmountWithSign = (amount: number): string => {
  if (amount === 0) return formatCurrencyKES(amount)
  return `${amount > 0 ? '+' : ''}${formatCurrencyKES(amount)}`
}

/**
 * Get apartment rent amount by apartment number
 */
export const getApartmentRent = (apartment: string): number => {
  const options = [
    { value: '1A1', rent: 18000 },
    { value: '1A2', rent: 18000 },
    { value: '1B1', rent: 15000 },
    { value: '1B2', rent: 15000 },
    { value: '2A1', rent: 18000 },
    { value: '2A2', rent: 18000 },
    { value: '2B1', rent: 15000 },
    { value: '2B2', rent: 15000 },
    { value: '3A1', rent: 18000 },
    { value: '3A2', rent: 18000 },
    { value: '3B1', rent: 15000 },
    { value: '3B2', rent: 15000 },
    { value: '4A1', rent: 18000 },
    { value: '4A2', rent: 18000 },
    { value: '4B1', rent: 15000 },
    { value: '4B2', rent: 15000 },
    { value: '5A1', rent: 18000 },
    { value: '5A2', rent: 18000 },
    { value: '5B1', rent: 15000 },
    { value: '5B2', rent: 15000 },
    { value: '6A1', rent: 18000 },
    { value: '6A2', rent: 18000 },
  ]
  
  const apartmentOption = options.find(opt => opt.value === apartment)
  return apartmentOption?.rent || 15000 // Default to 15000 if not found
}