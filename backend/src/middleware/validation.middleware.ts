import { AuthRequest } from '../types'
import { Request, Response, NextFunction } from 'express'
import { z, ZodError, AnyZodObject, ZodSchema, ZodEffects } from 'zod'
import { fromZodError } from 'zod-validation-error'

// Type for validation schema with body, query, and params
interface ValidationSchema {
  body?: AnyZodObject | ZodEffects<any, any>
  query?: AnyZodObject
  params?: AnyZodObject
}

export const validate = (schema: ZodSchema<any> | ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if it's a ValidationSchema with body/query/params
      if ('body' in schema || 'query' in schema || 'params' in schema) {
        const validationSchema = {
          body: (schema as ValidationSchema).body || z.object({}).strict(),
          query: (schema as ValidationSchema).query || z.object({}).strict(),
          params: (schema as ValidationSchema).params || z.object({}).strict(),
        }

        // Validate each part separately
        const bodyResult = validationSchema.body?.safeParse(req.body)
        const queryResult = validationSchema.query?.safeParse(req.query)
        const paramsResult = validationSchema.params?.safeParse(req.params)

        const errors = []
        
        if (bodyResult && !bodyResult.success) errors.push(...bodyResult.error.errors)
        if (queryResult && !queryResult.success) errors.push(...queryResult.error.errors)
        if (paramsResult && !paramsResult.success) errors.push(...paramsResult.error.errors)

        if (errors.length > 0) {
          const zodError = new ZodError(errors)
          const validationError = fromZodError(zodError as any) // Type assertion
          res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationError.details,
          })
          return
        }
      } else {
        // It's a direct ZodSchema
        (schema as ZodSchema).parse(req.body)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error as any) // Type assertion
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationError.details,
        })
        return
      }
      next(error)
    }
  }
}

// Common validation schemas
export const authSchemas = {
  login: {
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  },

  register: {
    body: z.object({
      email: z.string().email('Invalid email address'),
      phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      apartment: z.string(),
      unitType: z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']),
      moveInDate: z.string().datetime(),
      emergencyContact: z.string().optional(),
    }),
  },

  changePassword: {
    body: z.object({
      currentPassword: z.string().min(6, 'Current password is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Confirm password is required'),
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
  },

  refreshToken: {
    body: z.object({
      refreshToken: z.string(),
    }),
  },
}

export const paymentSchemas = {
  create: {
    body: z.object({
      type: z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER']),
      method: z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK']),
      amount: z.number().positive('Amount must be positive'),
      month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
      description: z.string().optional(),
      transactionCode: z.string().optional(),
      caretakerName: z.string().optional(),
    }).superRefine((data, ctx) => {
      // M-Pesa payments require transaction code
      if (data.method === 'MPESA' && !data.transactionCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Transaction code is required for M-Pesa payments',
          path: ['transactionCode'],
        })
      }
      // Cash payments require caretaker name
      if (data.method === 'CASH' && !data.caretakerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Caretaker name is required for cash payments',
          path: ['caretakerName'],
        })
      }
    }),
  },

  update: {
    params: z.object({
      id: z.string().cuid('Invalid payment ID'),
    }),
    body: z.object({
      status: z.enum(['VERIFIED', 'REJECTED', 'CANCELLED']).optional(),
      adminNotes: z.string().optional(),
    }),
  },

  verify: {
    params: z.object({
      id: z.string().cuid('Invalid payment ID'),
    }),
    body: z.object({
      status: z.enum(['VERIFIED', 'REJECTED']),
      adminNotes: z.string().optional(),
    }),
  },

  filter: {
    query: z.object({
      status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'CANCELLED']).optional(),
      type: z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER']).optional(),
      month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
      method: z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK']).optional(),
      tenantId: z.string().cuid('Invalid tenant ID').optional(),
      page: z.string().regex(/^\d+$/).transform(Number).default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  },
}

export const tenantSchemas = {
  create: {
    body: z.object({
      email: z.string().email('Invalid email address'),
      phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      apartment: z.string(),
      unitType: z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']),
      rentAmount: z.number().positive('Rent amount must be positive'),
      moveInDate: z.string().datetime(),
      leaseEndDate: z.string().datetime().optional(),
      emergencyContact: z.string().optional(),
      notes: z.string().optional(),
    }),
  },

  update: {
    params: z.object({
      id: z.string().cuid('Invalid tenant ID'),
    }),
    body: z.object({
      email: z.string().email('Invalid email address').optional(),
      phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number').optional(),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      apartment: z.string().optional(),
      unitType: z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']).optional(),
      rentAmount: z.number().positive('Rent amount must be positive').optional(),
      status: z.enum(['CURRENT', 'OVERDUE', 'DELINQUENT', 'EVICTED', 'FORMER']).optional(),
      moveInDate: z.string().datetime().optional(),
      leaseEndDate: z.string().datetime().optional(),
      emergencyContact: z.string().optional(),
      notes: z.string().optional(),
    }),
  },

  filter: {
    query: z.object({
      status: z.enum(['CURRENT', 'OVERDUE', 'DELINQUENT', 'EVICTED', 'FORMER']).optional(),
      unitType: z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']).optional(),
      floor: z.string().regex(/^\d+$/).transform(Number).optional(),
      apartment: z.string().optional(),
      search: z.string().optional(),
      page: z.string().regex(/^\d+$/).transform(Number).default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  },

  balance: {
    params: z.object({
      id: z.string().cuid('Invalid tenant ID'),
    }),
    body: z.object({
      amount: z.number().positive('Amount must be positive'),
      type: z.enum(['add', 'subtract']),
      reason: z.string().min(5, 'Reason must be at least 5 characters'),
    }),
  },
}

export const waterReadingSchemas = {
  create: {
    body: z.object({
      previousReading: z.number().int().nonnegative('Previous reading must be non-negative'),
      currentReading: z.number().int().nonnegative('Current reading must be non-negative'),
      month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
    }).refine(data => data.currentReading > data.previousReading, {
      message: 'Current reading must be greater than previous reading',
      path: ['currentReading'],
    }),
  },

  update: {
    params: z.object({
      id: z.string().cuid('Invalid reading ID'),
    }),
    body: z.object({
      previousReading: z.number().int().nonnegative('Previous reading must be non-negative').optional(),
      currentReading: z.number().int().nonnegative('Current reading must be non-negative').optional(),
    }).refine(data => {
      if (data.currentReading !== undefined && data.previousReading !== undefined) {
        return data.currentReading > data.previousReading
      }
      return true
    }, {
      message: 'Current reading must be greater than previous reading',
      path: ['currentReading'],
    }),
  },

  filter: {
    query: z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
      paid: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
      tenantId: z.string().cuid('Invalid tenant ID').optional(),
      page: z.string().regex(/^\d+$/).transform(Number).default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    }),
  },
}

export const maintenanceSchemas = {
  create: {
    body: z.object({
      title: z.string().min(5, 'Title must be at least 5 characters'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
      location: z.string().optional(),
    }),
  },

  update: {
    params: z.object({
      id: z.string().cuid('Invalid maintenance request ID'),
    }),
    body: z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      resolutionNotes: z.string().optional(),
      cost: z.number().positive('Cost must be positive').optional(),
    }),
  },

  filter: {
    query: z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      tenantId: z.string().cuid('Invalid tenant ID').optional(),
      page: z.string().regex(/^\d+$/).transform(Number).default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    }),
  },
}

export const analyticsSchemas = {
  getMetrics: {
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      period: z.enum(['day', 'week', 'month', 'year']).optional(),
    }),
  },

  export: {
    query: z.object({
      format: z.enum(['json', 'csv', 'pdf']).default('json'),
      type: z.enum(['payments', 'tenants', 'water', 'maintenance']),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
  },
}

export const fileSchemas = {
  upload: {
    body: z.object({
      type: z.enum(['payment', 'maintenance', 'contract', 'id_copy']),
      description: z.string().optional(),
    }),
  },
}

// Re-export everything in one object for easy import
export const schemas = {
  auth: authSchemas,
  payment: paymentSchemas,
  tenant: tenantSchemas,
  water: waterReadingSchemas,
  maintenance: maintenanceSchemas,
  analytics: analyticsSchemas,
  file: fileSchemas,
}
