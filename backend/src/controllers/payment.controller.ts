import { AuthRequest } from '../types'
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuditLogService } from '../services/audit.service'
import { ReceiptService } from '../services/receipt.service'
import { EmailService } from '../services/email.service'
import { FileService } from '../services/file.service'
import { config } from '../config/index'
import * as path from 'path'
import * as fs from 'fs/promises'

export class PaymentController {
  private auditLogService: AuditLogService
  private receiptService: ReceiptService
  private emailService: EmailService
  private fileService: FileService

  constructor() {
    this.auditLogService = new AuditLogService()
    this.receiptService = new ReceiptService()
    this.emailService = new EmailService()
    this.fileService = new FileService()
  }

  getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        month,
        tenantId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}

      if (status) {
        where.status = status
      }

      if (type) {
        where.type = type
      }

      if (month) {
        where.month = month
      }

      if (tenantId) {
        where.tenantId = tenantId
      }

      // Get payments with pagination
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder,
          },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                apartment: true,
                email: true,
              },
            },
            receipts: true,
          },
        }),
        prisma.payment.count({ where }),
      ])

      res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get all payments error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getPaymentById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              apartment: true,
              email: true,
              phone: true,
            },
          },
          receipts: true,
        },
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: payment,
      })
    } catch (error) {
      console.error('Get payment by ID error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  createPayment = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const {
        type,
        method,
        amount,
        month,
        description,
        transactionCode,
        caretakerName,
      } = req.body

      // Get tenant
      const tenant = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        })
      }

      // Handle file uploads
      const screenshotUrls: string[] = []
      
      // Check if files exist and handle both array and object types
      if (req.files) {
        let filesArray: Express.Multer.File[] = []
        
        if (Array.isArray(req.files)) {
          filesArray = req.files
        } else if (typeof req.files === "object") {
          // Convert object of arrays to single array
          const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] }
          filesArray = Object.values(filesObj).flat()
        }
        
        for (const file of filesArray) {
          const filePath = await this.fileService.saveFile(file, "payments")
          screenshotUrls.push(filePath)
        }
      }

      // Create payment
      const payment = await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          type,
          method,
          amount,
          currency: 'KES',
          month,
          year: parseInt(month.split('-')[0]),
          description,
          transactionCode,
          caretakerName,
          status: 'PENDING',
          screenshotUrls,
        },
      })

      // Update tenant balance if payment is for rent
      if (type === 'RENT') {
        const newBalance = Math.max(0, tenant.balance - amount)
        await prisma.user.update({
          where: { id: tenant.id },
          data: {
            balance: newBalance,
            status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
          },
        })
      }

      // Update water reading if payment is for water
      if (type === 'WATER') {
        await prisma.waterReading.updateMany({
          where: {
            tenantId: tenant.id,
            month,
            paid: false,
          },
          data: {
            paid: true,
            paymentId: payment.id,
          },
        })
      }

      // Log payment creation
      await this.auditLogService.log({
        userId: tenant.id,
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
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Send notification to admin
      await this.emailService.sendPaymentNotification(payment, tenant)

      return res.status(201).json({
        success: true,
        message: 'Payment submitted successfully and pending verification',
        data: payment,
      })
    } catch (error) {
      console.error('Create payment error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  verifyPayment = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { id } = req.params
      const { status, adminNotes } = req.body

      // Get payment
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          tenant: true,
        },
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        })
      }

      if (payment.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Payment is not pending verification',
        })
      }

      // Update payment
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status,
          verifiedAt: new Date(),
          verifiedBy: req.user.id,
          adminNotes,
        },
      })

      // If verified, generate receipt and update balances
      if (status === 'VERIFIED') {
        // Generate receipt
        const receiptData = {
          receiptNumber: `MTA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${payment.id.slice(-4).toUpperCase()}`,
          tenantName: payment.tenant.name,
          apartment: payment.tenant.apartment,
          paymentType: payment.type,
          amount: payment.amount,
          month: payment.month,
          date: new Date(),
          transactionCode: payment.transactionCode || undefined,
          caretakerName: payment.caretakerName || undefined
        }

        const receipt = await this.receiptService.generateReceipt(receiptData)
        
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

      // Log verification
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: status === 'VERIFIED' ? 'VERIFY' : 'REJECT',
        entity: 'PAYMENT',
        entityId: payment.id,
        oldData: { status: payment.status },
        newData: { status, adminNotes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Send notification to tenant
      await this.emailService.sendPaymentStatusNotification(payment.tenant, updatedPayment)

      return res.status(200).json({
        success: true,
        message: `Payment ${status.toLowerCase()} successfully`,
        data: updatedPayment,
      })
    } catch (error) {
      console.error('Verify payment error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getPendingPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20 } = req.query
      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { status: 'PENDING' },
          skip,
          take,
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

      res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get pending payments error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getTenantPayments = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const { page = 1, limit = 20, status, type, month } = req.query
      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = { tenantId: req.user.id }

      if (status) {
        where.status = status
      }

      if (type) {
        where.type = type
      }

      if (month) {
        where.month = month
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            receipts: true,
          },
        }),
        prisma.payment.count({ where }),
      ])

      return res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get tenant payments error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  deletePayment = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { id } = req.params

      // Get payment
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          receipts: true,
        },
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        })
      }

      // Delete associated receipts files
      for (const receipt of payment.receipts) {
        try {
          await fs.unlink(path.join(config.receiptsPath, receipt.filePath))
        } catch (error) {
          console.warn('Failed to delete receipt file:', error)
        }
      }

      // Delete payment
      await prisma.payment.delete({
        where: { id },
      })

      // Delete screenshot files
      for (const screenshotUrl of payment.screenshotUrls) {
        try {
          await fs.unlink(path.join(config.uploadPath, screenshotUrl))
        } catch (error) {
          console.warn('Failed to delete screenshot:', error)
        }
      }

      // Log deletion
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'DELETE',
        entity: 'PAYMENT',
        entityId: payment.id,
        oldData: payment,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Payment deleted successfully',
      })
    } catch (error) {
      console.error('Delete payment error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}