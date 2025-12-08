import { Request, Response } from 'express'
import bcrypt from "bcryptjs"
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { AuditLogService } from '../services/audit.service'
import { EmailService } from '../services/email.service'
import { config } from '../config/index'

export class TenantController {
  private auditLogService: AuditLogService
  private emailService: EmailService

  constructor() {
    this.auditLogService = new AuditLogService()
    this.emailService = new EmailService()
  }

  getAllTenants = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {
        role: 'TENANT',
      }

      if (status) {
        where.status = status
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
          { apartment: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      // Get tenants with pagination
      const [tenants, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            apartment: true,
            unitType: true,
            rentAmount: true,
            balance: true,
            status: true,
            moveInDate: true,
            leaseEndDate: true,
            emergencyContact: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                payments: true,
                waterReadings: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ])

      res.status(200).json({
        success: true,
        data: tenants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get all tenants error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getTenantById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params

      const tenant = await prisma.user.findUnique({
        where: { id, role: 'TENANT' },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          waterReadings: {
            orderBy: { month: 'desc' },
          },
          receipts: {
            include: { payment: true },
            orderBy: { generatedAt: 'desc' },
          },
          maintenanceRequests: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      })

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        })
      }

      // Calculate statistics
      const totalPaid = tenant.payments
        .filter(p => p.status === 'VERIFIED')
        .reduce((sum, payment) => sum + payment.amount, 0)

      const pendingPayments = tenant.payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, payment) => sum + payment.amount, 0)

      const totalWaterDue = tenant.waterReadings
        .filter(r => !r.paid)
        .reduce((sum, reading) => sum + reading.amount, 0)

      const tenantWithStats = {
        ...tenant,
        statistics: {
          totalPaid,
          pendingPayments,
          totalWaterDue,
          totalBalance: tenant.balance,
          paymentCount: tenant.payments.length,
          receiptCount: tenant.receipts.length,
          maintenanceCount: tenant.maintenanceRequests.length,
        },
      }

      return res.status(200).json({
        success: true,
        data: tenantWithStats,
      })
    } catch (error) {
      console.error('Get tenant by ID error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  createTenant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        email,
        phone,
        name,
        apartment,
        unitType,
        rentAmount,
        moveInDate,
        leaseEndDate,
        emergencyContact,
        notes,
      } = req.body

      // Check if apartment is available
      const existingTenant = await prisma.user.findUnique({
        where: { apartment },
      })

      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: `Apartment ${apartment} is already occupied`,
        })
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      const tenant = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          name,
          apartment,
          unitType,
          rentAmount,
          moveInDate: new Date(moveInDate),
          leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
          emergencyContact,
          notes,
          waterRate: config.waterRatePerUnit,
          balance: 0,
          status: 'CURRENT',
          role: 'TENANT',
        },
      })

      // Log tenant creation
      await this.auditLogService.log({
        userId: (req as AuthRequest).user?.id,
        userEmail: (req as AuthRequest).user?.email,
        userRole: (req as AuthRequest).user?.role,
        action: 'CREATE',
        entity: 'TENANT',
        entityId: tenant.id,
        newData: {
          apartment,
          unitType,
          rentAmount,
          moveInDate,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Send welcome email with credentials
      if (config.emailHost) {
        await this.emailService.sendWelcomeEmail(tenant, tempPassword)
      }

      // Remove password from response
      const { password, ...tenantWithoutPassword } = tenant

      return res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: tenantWithoutPassword,
        tempPassword: config.emailHost ? undefined : tempPassword, // Only return if email not configured
      })
    } catch (error) {
      console.error('Create tenant error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  updateTenant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params
      const updateData = req.body

      // Check if tenant exists
      const existingTenant = await prisma.user.findUnique({
        where: { id, role: 'TENANT' },
      })

      if (!existingTenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        })
      }

      // Check if apartment is being changed and is available
      if (updateData.apartment && updateData.apartment !== existingTenant.apartment) {
        const apartmentOccupied = await prisma.user.findUnique({
          where: { apartment: updateData.apartment },
        })

        if (apartmentOccupied) {
          return res.status(400).json({
            success: false,
            message: `Apartment ${updateData.apartment} is already occupied`,
          })
        }
      }

      // Convert date strings to Date objects
      if (updateData.moveInDate) {
        updateData.moveInDate = new Date(updateData.moveInDate)
      }
      if (updateData.leaseEndDate) {
        updateData.leaseEndDate = new Date(updateData.leaseEndDate)
      }

      const tenant = await prisma.user.update({
        where: { id },
        data: updateData,
      })

      // Log tenant update
      await this.auditLogService.log({
        userId: (req as AuthRequest).user?.id,
        userEmail: (req as AuthRequest).user?.email,
        userRole: (req as AuthRequest).user?.role,
        action: 'UPDATE',
        entity: 'TENANT',
        entityId: tenant.id,
        oldData: existingTenant,
        newData: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Remove password from response
      const { password, ...tenantWithoutPassword } = tenant

      return res.status(200).json({
        success: true,
        message: 'Tenant updated successfully',
        data: tenantWithoutPassword,
      })
    } catch (error) {
      console.error('Update tenant error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  deleteTenant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params

      // Check if tenant exists
      const existingTenant = await prisma.user.findUnique({
        where: { id, role: 'TENANT' },
      })

      if (!existingTenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        })
      }

      // Soft delete by marking as FORMER
      const tenant = await prisma.user.update({
        where: { id },
        data: {
          status: 'FORMER',
          apartment: `FORMER_${existingTenant.apartment}_${Date.now()}`, // Free up apartment number
        },
      })

      // Log tenant deletion
      await this.auditLogService.log({
        userId: (req as AuthRequest).user?.id,
        userEmail: (req as AuthRequest).user?.email,
        userRole: (req as AuthRequest).user?.role,
        action: 'DELETE',
        entity: 'TENANT',
        entityId: tenant.id,
        oldData: existingTenant,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Tenant marked as former successfully',
      })
    } catch (error) {
      console.error('Delete tenant error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getTenantDashboard = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const tenant = await prisma.user.findUnique({
        where: { id: req.user.id, role: 'TENANT' },
        include: {
          payments: {
            where: {
              createdAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Last 6 months
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          waterReadings: {
            where: {
              month: {
                gte: new Date().toISOString().slice(0, 7), // Current and future months
              },
            },
            orderBy: { month: 'desc' },
          },
          receipts: {
            include: { payment: true },
            orderBy: { generatedAt: 'desc' },
            take: 5,
          },
          maintenanceRequests: {
            where: {
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      })

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        })
      }

      // Calculate dashboard statistics
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      const currentMonthPayment = tenant.payments.find(
        p => p.month === currentMonth && p.type === 'RENT'
      )

      const pendingPayments = tenant.payments.filter(p => p.status === 'PENDING')
      const unpaidWater = tenant.waterReadings.filter(r => !r.paid)

      const dashboardData = {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          apartment: tenant.apartment,
          unitType: tenant.unitType,
          rentAmount: tenant.rentAmount,
          balance: tenant.balance,
          status: tenant.status,
          moveInDate: tenant.moveInDate,
        },
        statistics: {
          totalBalance: tenant.balance,
          pendingPayments: pendingPayments.length,
          pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
          unpaidWaterBills: unpaidWater.length,
          unpaidWaterAmount: unpaidWater.reduce((sum, r) => sum + r.amount, 0),
          activeMaintenanceRequests: tenant.maintenanceRequests.length,
        },
        currentMonth: {
          rentPaid: currentMonthPayment?.status === 'VERIFIED',
          rentPayment: currentMonthPayment,
          waterDue: unpaidWater.find(r => r.month === currentMonth)?.amount || 0,
        },
        recentPayments: tenant.payments.slice(0, 5),
        recentReceipts: tenant.receipts,
        maintenanceRequests: tenant.maintenanceRequests,
        waterReadings: tenant.waterReadings,
      }

      return res.status(200).json({
        success: true,
        data: dashboardData,
      })
    } catch (error) {
      console.error('Get tenant dashboard error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  updateTenantBalance = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params
      const { amount, type, notes } = req.body // type: 'ADD' | 'DEDUCT'

      // Check if tenant exists
      const tenant = await prisma.user.findUnique({
        where: { id, role: 'TENANT' },
      })

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        })
      }

      const newBalance = type === 'ADD' 
        ? tenant.balance + amount 
        : tenant.balance - amount

      const updatedTenant = await prisma.user.update({
        where: { id },
        data: {
          balance: newBalance,
          status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
        },
      })

      // Log balance update
      await this.auditLogService.log({
        userId: (req as AuthRequest).user?.id,
        userEmail: (req as AuthRequest).user?.email,
        userRole: (req as AuthRequest).user?.role,
        action: 'UPDATE',
        entity: 'TENANT',
        entityId: tenant.id,
        oldData: { balance: tenant.balance },
        newData: { balance: newBalance, type, amount, notes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Send notification to tenant if balance becomes negative
      if (newBalance > 0) {
        await this.emailService.sendBalanceNotification(tenant, newBalance)
      }

      return res.status(200).json({
        success: true,
        message: `Balance ${type === 'ADD' ? 'added to' : 'deducted from'} successfully`,
        data: {
          oldBalance: tenant.balance,
          newBalance: updatedTenant.balance,
          change: type === 'ADD' ? amount : -amount,
        },
      })
    } catch (error) {
      console.error('Update tenant balance error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
