// Montez A Apartments Configuration
export const MONTEZ_A_APARTMENTS = [
  // Floor 1
  { number: '1A1', floor: 1, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '1A2', floor: 1, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '1B1', floor: 1, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '1B2', floor: 1, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 2
  { number: '2A1', floor: 2, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '2A2', floor: 2, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '2B1', floor: 2, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '2B2', floor: 2, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 3
  { number: '3A1', floor: 3, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '3A2', floor: 3, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '3B1', floor: 3, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '3B2', floor: 3, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 4
  { number: '4A1', floor: 4, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '4A2', floor: 4, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '4B1', floor: 4, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '4B2', floor: 4, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Floor 5
  { number: '5A1', floor: 5, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '5A2', floor: 5, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '5B1', floor: 5, type: 'ONE_BEDROOM' as const, rent: 15000 },
  { number: '5B2', floor: 5, type: 'ONE_BEDROOM' as const, rent: 15000 },
  
  // Rooftop (Floor 6)
  { number: '6A1', floor: 6, type: 'TWO_BEDROOM' as const, rent: 18000 },
  { number: '6A2', floor: 6, type: 'TWO_BEDROOM' as const, rent: 18000 },
]

// Building Information
export const BUILDING_INFO = {
  name: 'Montez A Apartments',
  address: 'Kizito Road, Nairobi',
  totalUnits: 26,
  floors: 6,
  yearBuilt: 2018,
  amenities: [
    '24/7 Security',
    'Water Backup',
    'Parking Space',
    'Rooftop Garden',
  ],
}

// Payment Configuration
export const PAYMENT_CONFIG = {
  dueDate: 5, // 5th of each month
  gracePeriodDays: 5,
  lateFeePercentage: 5, // 5% of rent
  waterRatePerUnit: 150,
  securityDepositMonths: 2,
  paymentMethods: ['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK'] as const,
}

// Tenant Status Options
export const TENANT_STATUS = {
  CURRENT: 'CURRENT',
  OVERDUE: 'OVERDUE',
  DELINQUENT: 'DELINQUENT',
  EVICTED: 'EVICTED',
  FORMER: 'FORMER',
} as const

// Payment Status Options
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const

// Maintenance Priority Levels
export const MAINTENANCE_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

// Maintenance Status
export const MAINTENANCE_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TENANT: 'TENANT',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  PAYMENT: 'PAYMENT',
  MAINTENANCE: 'MAINTENANCE',
  SYSTEM: 'SYSTEM',
  ALERT: 'ALERT',
} as const

// Audit Actions
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VERIFY: 'VERIFY',
  REJECT: 'REJECT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const

// File Upload Configuration
export const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
  maxFilesPerUpload: 5,
}

// API Rate Limiting
export const RATE_LIMITS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PAYMENT_RECEIPT: 'payment_receipt',
  PAYMENT_REMINDER: 'payment_reminder',
  MAINTENANCE_UPDATE: 'maintenance_update',
  BALANCE_ALERT: 'balance_alert',
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  DATABASE: 'yyyy-MM-dd',
  DATABASE_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  MONTH_YEAR: 'MMM yyyy',
}

// Currency Configuration
export const CURRENCY = {
  code: 'KES',
  symbol: 'KSh',
  locale: 'en-KE',
}

// Water Consumption Estimates
export const WATER_ESTIMATES = {
  ONE_BEDROOM_PER_PERSON: 4, // units per month
  TWO_BEDROOM_PER_PERSON: 5, // units per month
  AVERAGE_OCCUPANCY: 2, // people per apartment
}

// Rent Rates (in KES)
export const RENT_RATES = {
  ONE_BEDROOM: 15000,
  TWO_BEDROOM: 18000,
}

// Security Settings
export const SECURITY = {
  passwordSaltRounds: 10,
  jwtExpiry: '7d',
  refreshTokenExpiry: '30d',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
}

// Analytics Configuration
export const ANALYTICS = {
  snapshotInterval: 24 * 60 * 60 * 1000, // 24 hours
  retentionDays: 365,
}

// Export Constants
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf',
  EXCEL: 'excel',
}

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_DATE: 'Please enter a valid date',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  PAYMENT_SUBMITTED: 'Payment submitted successfully',
  PAYMENT_VERIFIED: 'Payment verified successfully',
  TENANT_CREATED: 'Tenant created successfully',
  TENANT_UPDATED: 'Tenant updated successfully',
  RECEIPT_GENERATED: 'Receipt generated successfully',
  MAINTENANCE_SUBMITTED: 'Maintenance request submitted successfully',
}

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  PAYMENT_EXISTS: 'Payment already exists for this month',
  APARTMENT_OCCUPIED: 'Apartment is already occupied',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
}

// Status Codes
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
}