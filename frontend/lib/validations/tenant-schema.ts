import { z } from 'zod'

export const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^254[0-9]{9}$/, 'Phone number must be in format 254XXXXXXXXX'),
  apartment: z.string().min(2, 'Apartment number is required'),
  unitType: z.enum(['ONE_BEDROOM', 'TWO_BEDROOM'], {
    required_error: 'Unit type is required',
  }),
  rentAmount: z.number().min(15000, 'Rent amount must be at least KSh 15,000'),
  waterRate: z.number().min(0).default(150),
  balance: z.number().min(0).default(0),
  status: z.enum(['CURRENT', 'OVERDUE', 'DELINQUENT', 'EVICTED', 'FORMER']).default('CURRENT'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  leaseEndDate: z.string().optional(),
  emergencyContact: z.string().regex(/^254[0-9]{9}$/, 'Emergency contact must be in format 254XXXXXXXXX').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
})

export const updateTenantSchema = tenantSchema.partial()

export const tenantFilterSchema = z.object({
  status: z.enum(['CURRENT', 'OVERDUE', 'DELINQUENT', 'EVICTED', 'FORMER']).optional(),
  unitType: z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']).optional(),
  floor: z.number().min(1).max(6).optional(),
  apartment: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const balanceUpdateSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  type: z.enum(['add', 'subtract'], {
    required_error: 'Update type is required',
  }),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
})

export type TenantInput = z.infer<typeof tenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
export type TenantFilterInput = z.infer<typeof tenantFilterSchema>
export type BalanceUpdateInput = z.infer<typeof balanceUpdateSchema>