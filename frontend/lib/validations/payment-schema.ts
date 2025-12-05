import { z } from 'zod'

export const paymentUploadSchema = z.object({
  type: z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER'], {
    required_error: 'Payment type is required',
  }),
  method: z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK'], {
    required_error: 'Payment method is required',
  }),
  amount: z.number().min(100, 'Amount must be at least KSh 100'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
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

  // Validate amount based on type
  if (data.type === 'RENT' && data.amount < 15000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rent amount must be at least KSh 15,000',
      path: ['amount'],
    })
  }

  if (data.type === 'WATER' && data.amount < 150) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Water bill amount must be at least KSh 150',
      path: ['amount'],
    })
  }
})

export const paymentVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED'], {
    required_error: 'Status is required',
  }),
  adminNotes: z.string()
    .min(10, 'Notes must be at least 10 characters')
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
})

export const paymentFilterSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'CANCELLED']).optional(),
  type: z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM').optional(),
  method: z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type PaymentUploadInput = z.infer<typeof paymentUploadSchema>
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>