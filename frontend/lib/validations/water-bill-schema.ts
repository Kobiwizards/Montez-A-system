import { z } from 'zod'

export const waterReadingSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  previousReading: z.number().min(0, 'Previous reading must be 0 or greater'),
  currentReading: z.number().min(0, 'Current reading must be 0 or greater'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM'),
}).refine((data) => data.currentReading > data.previousReading, {
  message: 'Current reading must be greater than previous reading',
  path: ['currentReading'],
})

export const waterBillFilterSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM').optional(),
  paid: z.boolean().optional(),
  tenantId: z.string().optional(),
  floor: z.number().min(1).max(6).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const billPaymentSchema = z.object({
  paymentId: z.string().optional(),
})

export const waterCalculatorSchema = z.object({
  previousReading: z.number().min(0, 'Previous reading must be 0 or greater'),
  currentReading: z.number().min(0, 'Current reading must be 0 or greater'),
  rate: z.number().min(0).default(150),
})

export type WaterReadingInput = z.infer<typeof waterReadingSchema>
export type WaterBillFilterInput = z.infer<typeof waterBillFilterSchema>
export type BillPaymentInput = z.infer<typeof billPaymentSchema>
export type WaterCalculatorInput = z.infer<typeof waterCalculatorSchema>