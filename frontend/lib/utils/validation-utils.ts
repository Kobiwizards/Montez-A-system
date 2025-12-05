/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Kenyan phone number (254XXXXXXXXX)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^254[0-9]{9}$/
  return phoneRegex.test(phone)
}

/**
 * Validate M-Pesa transaction code
 */
export const isValidMpesaCode = (code: string): boolean => {
  const mpesaRegex = /^[A-Z0-9]{10,15}$/
  return mpesaRegex.test(code)
}

/**
 * Validate apartment number (e.g., 1A1, 6A2)
 */
export const isValidApartment = (apartment: string): boolean => {
  const apartmentRegex = /^[1-6][A-B][1-2]$/
  return apartmentRegex.test(apartment)
}

/**
 * Validate amount (positive number)
 */
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000 // Max 1 million
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Validate month string (YYYY-MM)
 */
export const isValidMonth = (monthStr: string): boolean => {
  const monthRegex = /^\d{4}-\d{2}$/
  if (!monthRegex.test(monthStr)) return false
  
  const [year, month] = monthStr.split('-').map(Number)
  return month >= 1 && month <= 12
}

/**
 * Get validation error message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.errors) return error.errors.join(', ')
  return 'An error occurred'
}

/**
 * Format validation errors from Zod
 */
export const formatZodErrors = (errors: any): Record<string, string> => {
  const formatted: Record<string, string> = {}
  
  if (errors?.error?.issues) {
    errors.error.issues.forEach((issue: any) => {
      const path = issue.path.join('.')
      formatted[path] = issue.message
    })
  }
  
  return formatted
}

/**
 * Check if object has errors
 */
export const hasErrors = (obj: Record<string, any>): boolean => {
  return Object.values(obj).some(value => value !== undefined && value !== '')
}

/**
 * Clear validation errors
 */
export const clearErrors = (setError: Function): void => {
  setError({})
}

/**
 * Validate file upload
 */
export const validateFileUpload = (
  files: File[],
  options: {
    maxFiles?: number
    maxSize?: number
    allowedTypes?: string[]
  } = {}
): { valid: boolean; errors: string[] } => {
  const {
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  } = options
  
  const errors: string[] = []
  
  // Check number of files
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`)
  }
  
  // Check each file
  files.forEach((file, index) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
    }
    
    // Check file size
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)
      errors.push(`File ${index + 1}: Size ${sizeMB}MB exceeds maximum ${maxSizeMB}MB`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove JavaScript protocol
    .substring(0, 1000) // Limit length
}