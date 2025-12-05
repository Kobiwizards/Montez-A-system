import { prisma } from '../lib/prisma'
import { config } from '../config'
import { EmailService } from './email.service'
import { ReceiptService } from './receipt.service'
import { AuditLogService } from './audit.service'

export interface CreatePaymentData {
  tenantId: string
  type: 'RENT' | 'WATER' | 'MAINTENANCE' | 'OTHER'
  method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK'
  amount: number
  month: string
  description?: string
  transactionCode?: string
  caretakerName?: string
  screenshotUrls: string[]
}

export interface VerifyPaymentData {
  status: 'VERIFIED' | 'REJECTED'
  adminNotes?: string
  verifiedBy: string
}

export class PaymentService {
  private emailService: EmailService
  private receiptService: ReceiptService
  private auditLogService: AuditLogService

  constructor() {
    this.emailService = new EmailService()
    this.receiptService = new ReceiptService()
    this.auditLogService = new AuditLogService()
  }

  async createPayment(data: CreatePaymentData) {
    const { tenantId, type, method, amount, month, screenshotUrls } = data

    // Validate tenant exists
    const tenant = await prisma.user.findUnique({
      where: { id: tenantId },
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    // Validate amount for rent payments
    if (type === 'RENT' && amount !== tenant.rentAmount) {
      throw new Error(`Rent amount must be exactly KSh ${tenant.rentAmount}`)
    }

    // Check for duplicate payment for same month and type
    const existingPayment = await prisma.payment.findFirst({
      where: {
        tenantId,
        type,
        month,
        status: { in: ['PENDING', 'VERIFIED'] },
      },
    })

    if (existingPayment) {
      throw new Error(`${type} payment for ${month} already exists`)
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        type,
        method,
        amount,
        currency: 'KES',
        month,
        year: parseInt(month.split('-')[0]),
        description: data.description,
        transactionCode: data.transactionCode,
        caretakerName: data.caretakerName,
        status: 'PENDING',
        screenshotUrls,
      },
    })

    // If this is a rent payment, update tenant balance
    if (type === 'RENT') {
      const newBalance = Math.max(0, tenant.balance - amount)
      await prisma.user.update({
        where: { id: tenantId },
        data: {
          balance: newBalance,
          status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
        },
      })
    }

    // If this is a water payment, mark water readings as paid
    if (type === 'WATER') {
      await prisma.waterReading.updateMany({
        where: {
          tenantId,
          month,
          paid: false,
        },
        data: {
          paid: true,
          paymentId: payment.id,
        },
      })
    }

    // Send notification to admin
    await this.emailService.sendPaymentNotification(payment, tenant)

    // Create audit log
    await this.auditLogService.log({
      userId: tenantId,
      userEmail: tenant.email,
      userRole: tenant.role,
      action: 'CREATE',
      entity: 'PAYMENT',
      entityId: payment.id,
      newData: {
        type,
        amount,
        month,
        method,
      },
    })

    return payment
  }

  async verifyPayment(paymentId: string, data: VerifyPaymentData) {
    const { status, adminNotes, verifiedBy } = data

    // Get payment with tenant details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: true,
      },
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'PENDING') {
      throw new Error('Payment is not pending verification')
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        verifiedAt: new Date(),
        verifiedBy,
        adminNotes,
      },
    })

    // If verified, process the payment
    if (status === 'VERIFIED') {
      // Generate receipt
      const receipt = await this.receiptService.generateReceipt(payment)
      
      // Update tenant balance for rent payments
      if (payment.type === 'RENT') {
        const newBalance = Math.max(0, payment.tenant.balance - payment.amount)
        await prisma.user.update({
          where: { id: payment.tenantId },
          data: {
            balance: newBalance,
            status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
          },
        })
      }

      // Mark water readings as paid
      if (payment.type === 'WATER') {
        await prisma.waterReading.updateMany({
          where: {
            tenantId: payment.tenantId,
            month: payment.month,
            paid: false,
          },
          data: {
            paid: true,
            paymentId: payment.id,
          },
        })
      }

      // Send receipt to tenant
      await this.emailService.sendReceiptEmail(payment.tenant, receipt)
    }

    // Send payment status notification to tenant
    await this.emailService.sendPaymentStatusNotification(payment.tenant, updatedPayment)

    // Create audit log
    await this.auditLogService.log({
      userId: verifiedBy,
      userEmail: payment.tenant.email,
      userRole: 'ADMIN',
      action: status === 'VERIFIED' ? 'VERIFY' : 'REJECT',
      entity: 'PAYMENT',
      entityId: payment.id,
      oldData: { status: payment.status },
      newData: { status, adminNotes },
    })

    return updatedPayment
  }

  async getPaymentStatistics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    // Get payments in period
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Calculate statistics
    const totalPayments = payments.length
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    const verifiedPayments = payments.filter(p => p.status === 'VERIFIED').length
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length
    const rejectedPayments = payments.filter(p => p.status === 'REJECTED').length

    const byType = {
      RENT: payments.filter(p => p.type === 'RENT').reduce((sum, p) => sum + p.amount, 0),
      WATER: payments.filter(p => p.type === 'WATER').reduce((sum, p) => sum + p.amount, 0),
      MAINTENANCE: payments.filter(p => p.type === 'MAINTENANCE').reduce((sum, p) => sum + p.amount, 0),
      OTHER: payments.filter(p => p.type === 'OTHER').reduce((sum, p) => sum + p.amount, 0),
    }

    const byMethod = {
      MPESA: payments.filter(p => p.method === 'MPESA').length,
      CASH: payments.filter(p => p.method === 'CASH').length,
      BANK_TRANSFER: payments.filter(p => p.method === 'BANK_TRANSFER').length,
      CHECK: payments.filter(p => p.method === 'CHECK').length,
    }

    // Get average verification time for verified payments
    const verifiedPaymentsWithTime = payments.filter(p => 
      p.status === 'VERIFIED' && p.verifiedAt && p.createdAt
    )

    const avgVerificationTime = verifiedPaymentsWithTime.length > 0
      ? verifiedPaymentsWithTime.reduce((sum, p) => {
          const verificationTime = p.verifiedAt!.getTime() - p.createdAt.getTime()
          return sum + verificationTime
        }, 0) / verifiedPaymentsWithTime.length
      : 0

    return {
      period,
      totalPayments,
      totalAmount,
      verifiedPayments,
      pendingPayments,
      rejectedPayments,
      verificationRate: totalPayments > 0 ? (verifiedPayments / totalPayments) * 100 : 0,
      byType,
      byMethod,
      averageVerificationTime: avgVerificationTime / (1000 * 60 * 60), // Convert to hours
      startDate,
      endDate: new Date(),
    }
  }

  async getPendingPayments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              apartment: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
    ])

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async processBulkVerification(paymentIds: string[], status: 'VERIFIED' | 'REJECTED', adminNotes?: string, verifiedBy: string) {
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    }

    for (const paymentId of paymentIds) {
      try {
        await this.verifyPayment(paymentId, {
          status,
          adminNotes,
          verifiedBy,
        })
        results.successful.push(paymentId)
      } catch (error) {
        results.failed.push({
          id: paymentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  async getTenantPaymentHistory(tenantId: string, filters: {
    startDate?: Date
    endDate?: Date
    type?: string
    status?: string
    page?: number
    limit?: number
  } = {}) {
    const {
      startDate,
      endDate,
      type,
      status,
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit

    const where: any = { tenantId }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    if (type) where.type = type
    if (status) where.status = status

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          receipts: true,
        },
      }),
      prisma.payment.count({ where }),
    ])

    // Calculate summary statistics
    const summary = {
      totalPayments: total,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      verifiedAmount: payments
        .filter(p => p.status === 'VERIFIED')
        .reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0),
      byType: payments.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + p.amount
        return acc
      }, {} as Record<string, number>),
    }

    return {
      payments,
      summary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async calculateProjectedRevenue(months: number = 12) {
    // Get all tenants
    const tenants = await prisma.user.findMany({
      where: { role: 'TENANT' },
    })

    // Get current month
    const currentDate = new Date()
    const projections = []

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(currentDate)
      monthDate.setMonth(monthDate.getMonth() + i)
      const monthStr = monthDate.toISOString().slice(0, 7)

      // Calculate projected rent
      const projectedRent = tenants.reduce((sum, tenant) => {
        // Check if tenant is expected to still be occupying
        if (tenant.leaseEndDate && tenant.leaseEndDate < monthDate) {
          return sum // Tenant has moved out
        }
        return sum + tenant.rentAmount
      }, 0)

      // Estimate water revenue (average of last 3 months)
      const lastThreeMonths = Array.from({ length: 3 }, (_, j) => {
        const date = new Date(monthDate)
        date.setMonth(date.getMonth() - j - 1)
        return date.toISOString().slice(0, 7)
      })

      const waterReadings = await prisma.waterReading.findMany({
        where: {
          month: { in: lastThreeMonths },
        },
      })

      const avgWaterRevenue = waterReadings.length > 0
        ? waterReadings.reduce((sum, r) => sum + r.amount, 0) / lastThreeMonths.length
        : 0

      projections.push({
        month: monthStr,
        projectedRent,
        projectedWater: avgWaterRevenue,
        totalProjected: projectedRent + avgWaterRevenue,
        expectedTenants: tenants.filter(t => 
          !t.leaseEndDate || t.leaseEndDate >= monthDate
        ).length,
      })
    }

    return projections
  }
}