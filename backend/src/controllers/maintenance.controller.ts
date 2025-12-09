import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { AuditLogService } from '../services/audit.service'
import { EmailService } from '../services/email.service'
import { FileService, UploadedFile } from '../services/file.service'

export class MaintenanceController {
  private auditLogService: AuditLogService
  private emailService: EmailService
  private fileService: FileService

  constructor() {
    this.auditLogService = new AuditLogService()
    this.emailService = new EmailService()
    this.fileService = new FileService()
  }

  createRequest = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const { title, description, priority, location } = req.body

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
      const imageUrls: string[] = []
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const filePath = await this.fileService.saveFile(
            file as UploadedFile,
            tenant.id,
            'maintenance'
          )
          imageUrls.push(filePath)
        }
      }

      // Create maintenance request
      const maintenanceRequest = await prisma.maintenanceRequest.create({
        data: {
          tenantId: tenant.id,
          title,
          description,
          priority: priority || 'MEDIUM',
          status: 'PENDING',
          apartment: tenant.apartment,
          location,
          imageUrls,
        },
      })

      // Log creation
      await this.auditLogService.log({
        userId: tenant.id,
        userEmail: tenant.email,
        userRole: tenant.role,
        action: 'CREATE',
        entity: 'MAINTENANCE_REQUEST',
        entityId: maintenanceRequest.id,
        newData: {
          title,
          priority,
          apartment: tenant.apartment,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Send notification to admin
      await this.emailService.sendMaintenanceUpdate(
        tenant,
        maintenanceRequest,
        'created'
      )

      return res.status(201).json({
        success: true,
        message: 'Maintenance request submitted successfully',
        data: maintenanceRequest,
      })
    } catch (error) {
      console.error('Create maintenance request error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        apartment,
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

      if (priority) {
        where.priority = priority
      }

      if (apartment) {
        where.apartment = apartment
      }

      const [requests, total] = await Promise.all([
        prisma.maintenanceRequest.findMany({
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
                phone: true,
              },
            },
          },
        }),
        prisma.maintenanceRequest.count({ where }),
      ])

      // Calculate statistics
      const statistics = {
        total,
        pending: requests.filter(r => r.status === 'PENDING').length,
        inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: requests.filter(r => r.status === 'COMPLETED').length,
        byPriority: {
          LOW: requests.filter(r => r.priority === 'LOW').length,
          MEDIUM: requests.filter(r => r.priority === 'MEDIUM').length,
          HIGH: requests.filter(r => r.priority === 'HIGH').length,
          URGENT: requests.filter(r => r.priority === 'URGENT').length,
        },
      }

      res.status(200).json({
        success: true,
        data: requests,
        statistics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get all maintenance requests error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getRequestById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params

      const request = await prisma.maintenanceRequest.findUnique({
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
        },
      })

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found',
        })
      }

      // Check if user has permission to view this request
      if (req.user?.role === 'TENANT' && request.tenantId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden',
        })
      }

      return res.status(200).json({
        success: true,
        data: request,
      })
    } catch (error) {
      console.error('Get maintenance request by ID error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  updateRequestStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { id } = req.params
      const { status, resolutionNotes, cost, resolvedBy } = req.body

      // Get existing request
      const existingRequest = await prisma.maintenanceRequest.findUnique({
        where: { id },
        include: {
          tenant: true,
        },
      })

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found',
        })
      }

      // Prepare update data
      const updateData: any = { status }
      
      if (status === 'COMPLETED') {
        updateData.resolvedAt = new Date()
        updateData.resolvedBy = resolvedBy || req.user.id
        if (resolutionNotes) updateData.resolutionNotes = resolutionNotes
        if (cost) updateData.cost = cost
      }

      // Update request
      const request = await prisma.maintenanceRequest.update({
        where: { id },
        data: updateData,
      })

      // Log update
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'UPDATE',
        entity: 'MAINTENANCE_REQUEST',
        entityId: request.id,
        oldData: { status: existingRequest.status },
        newData: { status, resolutionNotes, cost },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Send notification to tenant
      await this.emailService.sendMaintenanceUpdate(
        existingRequest.tenant,
        request,
        
      )

      return res.status(200).json({
        success: true,
        message: 'Maintenance request updated successfully',
        data: request,
      })
    } catch (error) {
      console.error('Update maintenance request status error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  updateRequest = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { id } = req.params
      const updateData = req.body

      // Get existing request
      const existingRequest = await prisma.maintenanceRequest.findUnique({
        where: { id },
      })

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found',
        })
      }

      // Update request
      const request = await prisma.maintenanceRequest.update({
        where: { id },
        data: updateData,
      })

      // Log update
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'UPDATE',
        entity: 'MAINTENANCE_REQUEST',
        entityId: request.id,
        oldData: existingRequest,
        newData: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Maintenance request updated successfully',
        data: request,
      })
    } catch (error) {
      console.error('Update maintenance request error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  deleteRequest = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        })
      }

      const { id } = req.params

      // Get existing request
      const existingRequest = await prisma.maintenanceRequest.findUnique({
        where: { id },
      })

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance request not found',
        })
      }

      // Delete associated images
      for (const imageUrl of existingRequest.imageUrls) {
        try {
          await this.fileService.deleteFile(imageUrl)
        } catch (error) {
          console.warn('Failed to delete maintenance image:', error)
        }
      }

      // Delete request
      await prisma.maintenanceRequest.delete({
        where: { id },
      })

      // Log deletion
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'DELETE',
        entity: 'MAINTENANCE_REQUEST',
        entityId: existingRequest.id,
        oldData: existingRequest,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Maintenance request deleted successfully',
      })
    } catch (error) {
      console.error('Delete maintenance request error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getTenantRequests = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const { page = 1, limit = 20, status, priority } = req.query
      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = { tenantId: req.user.id }

      if (status) {
        where.status = status
      }

      if (priority) {
        where.priority = priority
      }

      const [requests, total] = await Promise.all([
        prisma.maintenanceRequest.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.maintenanceRequest.count({ where }),
      ])

      return res.status(200).json({
        success: true,
        data: requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get tenant maintenance requests error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
