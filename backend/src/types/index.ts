import { Request } from 'express'
import { User } from '@prisma/client'

// Main AuthRequest type that properly extends Express Request
export interface AuthRequest extends Request {
  user?: User
  userId?: string
}

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

// Date range filter
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

// Payment filter
export interface PaymentFilter extends DateRangeFilter {
  status?: string;
  type?: string;
  method?: string;
  tenantId?: string;
}

// Maintenance filter
export interface MaintenanceFilter extends DateRangeFilter {
  status?: string;
  priority?: string;
  apartment?: string;
}

// Stats types
export interface DashboardStats {
  totalRentDue: number;
  totalRentPaid: number;
  totalWaterDue: number;
  totalWaterPaid: number;
  occupancyRate: number;
  pendingPayments: number;
  maintenanceRequests: number;
  currentTenants: number;
  overdueTenants: number;
}

// Water billing
export interface WaterReadingInput {
  previousReading: number;
  currentReading: number;
  month: string;
  year: number;
  rate?: number;
}

export interface WaterBill extends WaterReadingInput {
  units: number;
  amount: number;
  paid: boolean;
}

// Receipt generation
export interface ReceiptData {
  tenantName: string;
  apartment: string;
  receiptNumber: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  transactionCode?: string;
  description: string;
  balance: number;
  waterUnits?: number;
  waterAmount?: number;
  totalAmount: number;
}

// Notification
export interface NotificationData {
  title: string;
  message: string;
  type: 'PAYMENT' | 'MAINTENANCE' | 'SYSTEM' | 'ALERT';
  userId: string;
  relatedId?: string;
  relatedType?: string;
}

// Audit log
export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Email data
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// File service
export interface FileServiceResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

// Re-export all other types
export * from './auth.types';
export * from './tenant.types';
export * from './payment.types';
export * from './receipt.types';
export * from './analytics.types';
export * from './water.types';
export * from './maintenance.types';
export * from './notification.types';
