import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { ReceiptService } from '../services/receipt.service'
import { AuditLogService } from '../services/audit.service'
import { config } from '../config/index'
import path from 'path'
import fs from 'fs/promises'

export class ReceiptController {
  private receiptService: ReceiptService
  private auditLogService: AuditLogService

  constructor() {
    this.receiptService = new ReceiptService()
    this.auditLogService = new AuditLogService()
  }

  getReceiptById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params

      const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
          payment: {
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
            },
          },
        },
      })

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found',
        })
      }

      // Track download
      await prisma.receipt.update({
        where: { id },
        data: {
          downloaded: true,
          downloadedAt: new Date(),
          downloadCount: { increment: 1 },
        },
      })

      return res.status(200).json({
        success: true,
        data: receipt,
      })
    } catch (error) {
      console.error('Get receipt by ID error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  downloadReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      const receipt = await prisma.receipt.findUnique({
        where: { id },
        include: {
          payment: {
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
            },
          },
        },
      })

      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found',
        })
        return
      }

      const filePath = path.join(config.receiptsPath, receipt.filePath)
      
      try {
        await fs.access(filePath)
      } catch {
        // Regenerate receipt if file doesn't exist
        // First get the full payment with tenant data
        const fullPayment = await prisma.payment.findUnique({
          where: { id: receipt.paymentId },
          include: {
            tenant: true,
          },
        })

        if (fullPayment) {
          await this.receiptService.generateReceipt(fullPayment)
        }
      }

      // Track download
      await prisma.receipt.update({
        where: { id },
        data: {
          downloaded: true,
          downloadedAt: new Date(),
          downloadCount: { increment: 1 },
        },
      })

      res.download(filePath, `receipt-${receipt.receiptNumber}.pdf`, (err) => {
        if (err) {
          console.error('Download error:', err)
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Failed to download receipt',
            })
          }
        }
      })
    } catch (error) {
      console.error('Download receipt error:', error)
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        })
      }
    }
  }

  generateReceipt = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { paymentId } = req.params

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          tenant: true,
          receipts: true,
        },
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        })
      }

      if (payment.status !== 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'Only verified payments can have receipts',
        })
      }

      // Check if receipt already exists
      if (payment.receipts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Receipt already exists for this payment',
        })
      }

      const receipt = await this.receiptService.generateReceipt(payment)

      // Log receipt generation
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'CREATE',
        entity: 'RECEIPT',
        entityId: receipt.id,
        newData: {
          receiptNumber: receipt.receiptNumber,
          paymentId: payment.id,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(201).json({
        success: true,
        message: 'Receipt generated successfully',
        data: receipt,
      })
    } catch (error) {
      console.error('Generate receipt error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getTenantReceipts = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const { page = 1, limit = 20, startDate, endDate } = req.query
      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {
        payment: {
          tenantId: req.user.id,
        },
      }

      if (startDate || endDate) {
        where.generatedAt = {}
        if (startDate) where.generatedAt.gte = new Date(startDate as string)
        if (endDate) where.generatedAt.lte = new Date(endDate as string)
      }

      const [receipts, total] = await Promise.all([
        prisma.receipt.findMany({
          where,
          skip,
          take,
          orderBy: { generatedAt: 'desc' },
          include: {
            payment: {
              select: {
                type: true,
                amount: true,
                month: true,
                method: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.receipt.count({ where }),
      ])

      return res.status(200).json({
        success: true,
        data: receipts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get tenant receipts error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getAllReceipts = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        tenantId,
        sortBy = 'generatedAt',
        sortOrder = 'desc',
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}

      if (startDate || endDate) {
        where.generatedAt = {}
        if (startDate) where.generatedAt.gte = new Date(startDate as string)
        if (endDate) where.generatedAt.lte = new Date(endDate as string)
      }

      if (tenantId) {
        where.payment = { tenantId: tenantId as string }
      }

      const [receipts, total] = await Promise.all([
        prisma.receipt.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder,
          },
          include: {
            payment: {
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
            },
          },
        }),
        prisma.receipt.count({ where }),
      ])

      res.status(200).json({
        success: true,
        data: receipts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get all receipts error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  deleteReceipt = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { id } = req.params

      const receipt = await prisma.receipt.findUnique({
        where: { id },
      })

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found',
        })
      }

      // Delete file
      try {
        const filePath = path.join(config.receiptsPath, receipt.filePath)
        await fs.unlink(filePath)
      } catch (error) {
        console.warn('Failed to delete receipt file:', error)
      }

      // Delete from database
      await prisma.receipt.delete({
        where: { id },
      })

      // Log deletion
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'DELETE',
        entity: 'RECEIPT',
        entityId: receipt.id,
        oldData: receipt,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Receipt deleted successfully',
      })
    } catch (error) {
      console.error('Delete receipt error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
