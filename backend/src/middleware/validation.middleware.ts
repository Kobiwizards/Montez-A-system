import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error)
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationError.details,
        })
      }
      next(error)
    }
  }
}

// Common validation schemas
export const authSchemas = {
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  }),

  register: z.object({
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
  }),
}

export const paymentSchemas = {
  create: z.object({
    body: z.object({
      type: z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER']),
      method: z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK']),
      amount: z.number().positive('Amount must be positive'),
      month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
      description: z.string().optional(),
      transactionCode: z.string().optional(),
      caretakerName: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().cuid('Invalid payment ID'),
    }),
    body: z.object({
      status: z.enum(['VERIFIED', 'REJECTED', 'CANCELLED']).optional(),
      adminNotes: z.string().optional(),
    }),
  }),

  verify: z.object({
    params: z.object({
      id: z.string().cuid('Invalid payment ID'),
    }),
    body: z.object({
      status: z.enum(['VERIFIED', 'REJECTED']),
      adminNotes: z.string().optional(),
    }),
  }),
}

export const tenantSchemas = {
  create: z.object({
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
  }),

  update: z.object({
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
  }),
}

export const waterReadingSchemas = {
  create: z.object({
    body: z.object({
      previousReading: z.number().int().nonnegative('Previous reading must be non-negative'),
      currentReading: z.number().int().nonnegative('Current reading must be non-negative'),
      month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().cuid('Invalid reading ID'),
    }),
    body: z.object({
      previousReading: z.number().int().nonnegative('Previous reading must be non-negative').optional(),
      currentReading: z.number().int().nonnegative('Current reading must be non-negative').optional(),
    }),
  }),
}

export const analyticsSchemas = {
  getMetrics: z.object({
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      period: z.enum(['day', 'week', 'month', 'year']).optional(),
    }),
  }),
}