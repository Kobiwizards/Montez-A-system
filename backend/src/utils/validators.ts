import { z } from 'zod'

export class Validators {
  static email = z.string().email('Invalid email address')
  
  static phone = z.string().regex(
    /^(\+254|0)[17]\d{8}$/,
    'Invalid Kenyan phone number. Format: +2547XXXXXXXX or 07XXXXXXXX'
  )
  
  static password = z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
  
  static name = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  
  static apartmentNumber = z.string()
    .regex(/^[1-6][AB][12]$/, 'Invalid apartment number. Format: 1A1, 2B2, etc.')
  
  static amount = z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large')
  
  static month = z.string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
    .refine((val) => {
      const [year, month] = val.split('-').map(Number)
      return month >= 1 && month <= 12
    }, 'Month must be between 01 and 12')
  
  static date = z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
  
  static transactionCode = z.string()
    .regex(/^[A-Z0-9]{8,12}$/, 'Invalid transaction code format')
    .optional()
  
  static caretakerName = z.string()
    .min(2, 'Caretaker name must be at least 2 characters')
    .max(100, 'Caretaker name must be less than 100 characters')
    .optional()
  
  static description = z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
  
  static notes = z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
  
  static emergencyContact = z.string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Invalid emergency contact number')
    .optional()
  
  static waterReading = z.number()
    .int('Reading must be a whole number')
    .nonnegative('Reading cannot be negative')
    .max(10000, 'Reading is too large')
  
  static fileSize = (maxSize: number) => 
    z.instanceof(Buffer)
      .refine((buf) => buf.length <= maxSize, `File size must be less than ${maxSize / 1024 / 1024}MB`)
  
  static fileType = (allowedTypes: string[]) =>
    z.string()
      .refine((type) => allowedTypes.includes(type), `File type must be one of: ${allowedTypes.join(', ')}`)
  
  static validateKenyanID(id: string): boolean {
    // Basic Kenyan ID validation (simplified)
    const regex = /^\d{8,9}$/
    return regex.test(id)
  }
  
  static validateKRApin(pin: string): boolean {
    // Basic KRA PIN validation (simplified)
    const regex = /^[A-Z]\d{9}[A-Z]$/
    return regex.test(pin)
  }
  
  static validateMpesaCode(code: string): boolean {
    // M-Pesa transaction code validation
    const regex = /^[A-Z0-9]{10}$/
    return regex.test(code)
  }
  
  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }
  
  static validateURL(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  static validateEmailList(emails: string[]): { valid: string[]; invalid: string[] } {
    const emailSchema = z.string().email()
    const valid: string[] = []
    const invalid: string[] = []
    
    emails.forEach(email => {
      try {
        emailSchema.parse(email)
        valid.push(email)
      } catch {
        invalid.push(email)
      }
    })
    
    return { valid, invalid }
  }
  
  static validatePhoneList(phones: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []
    
    phones.forEach(phone => {
      if (this.phone.safeParse(phone).success) {
        valid.push(phone)
      } else {
        invalid.push(phone)
      }
    })
    
    return { valid, invalid }
  }
  
  static sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/script/gi, '') // Remove script tags
      .trim()
  }
  
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeInput(item) : item
        )
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized as T
  }
  
  static validatePasswordStrength(password: string): {
    score: number
    strength: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
    suggestions: string[]
  } {
    const suggestions: string[] = []
    let score = 0
    
    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length < 8) suggestions.push('Use at least 8 characters')
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters')
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters')
    if (!/\d/.test(password)) suggestions.push('Add numbers')
    if (!/[^A-Za-z0-9]/.test(password)) suggestions.push('Add special characters')
    
    // Determine strength
    let strength: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
    if (score <= 2) strength = 'Weak'
    else if (score === 3) strength = 'Fair'
    else if (score === 4) strength = 'Good'
    else if (score === 5) strength = 'Strong'
    else strength = 'Very Strong'
    
    return { score, strength, suggestions }
  }
  
  static validateBusinessHours(hours: {
    open: string
    close: string
  }): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    
    if (!timeRegex.test(hours.open) || !timeRegex.test(hours.close)) {
      return false
    }
    
    const [openHour, openMinute] = hours.open.split(':').map(Number)
    const [closeHour, closeMinute] = hours.close.split(':').map(Number)
    
    const openTime = openHour * 60 + openMinute
    const closeTime = closeHour * 60 + closeMinute
    
    return openTime < closeTime
  }
  
  static validatePostalCode(code: string, country: string = 'KE'): boolean {
    if (country === 'KE') {
      // Kenyan postal codes are 5 digits
      return /^\d{5}$/.test(code)
    }
    // Add other country validations as needed
    return true
  }
}