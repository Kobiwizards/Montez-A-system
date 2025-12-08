import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { config } from '../config/index'
import { AuthRequest } from '../middleware/auth.middleware'
import { AuditLogService } from '../services/audit.service'

export class AuthController {
  private auditLogService: AuditLogService

  constructor() {
    this.auditLogService = new AuditLogService()
  }

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        })
      }

      // Check if tenant account is active
      if (user.role === 'TENANT' && user.status !== 'CURRENT') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active. Please contact management.',
        })
      }

      // Generate tokens
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          apartment: user.apartment === 'ADMIN' ? undefined : user.apartment,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      )

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        config.refreshTokenSecret,
        { expiresIn: config.refreshTokenExpiresIn }
      )

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      })

      // Log login activity
      await this.auditLogService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        email,
        phone,
        password,
        name,
        apartment,
        unitType,
        rentAmount,
        moveInDate,
        emergencyContact,
        notes,
      } = req.body

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        })
      }

      // Check if apartment is already occupied
      const existingTenant = await prisma.user.findUnique({
        where: { apartment },
      })

      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: `Apartment ${apartment} is already occupied`,
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          name,
          apartment,
          unitType,
          rentAmount,
          moveInDate: new Date(moveInDate),
          emergencyContact,
          notes,
          waterRate: config.waterRatePerUnit,
          balance: 0,
          status: 'CURRENT',
          role: 'TENANT',
        },
      })

      // Log registration
      await this.auditLogService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'CREATE',
        entity: 'USER',
        entityId: user.id,
        newData: {
          apartment,
          unitType,
          moveInDate,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        data: userWithoutPassword,
      })
    } catch (error) {
      console.error('Registration error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  getProfile = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          waterReadings: {
            orderBy: { month: 'desc' },
            take: 3,
          },
          receipts: {
            include: { payment: true },
            orderBy: { generatedAt: 'desc' },
            take: 5,
          },
        },
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
      })
    } catch (error) {
      console.error('Get profile error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  updateProfile = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const { phone, emergencyContact, notes } = req.body

      // Only allow tenants to update specific fields
      const updateData: any = {}
      if (phone) updateData.phone = phone
      if (emergencyContact) updateData.emergencyContact = emergencyContact
      if (notes) updateData.notes = notes

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
      })

      // Log profile update
      await this.auditLogService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'UPDATE',
        entity: 'USER',
        entityId: user.id,
        newData: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      // Remove password from response
      const { password, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword,
      })
    } catch (error) {
      console.error('Update profile error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  changePassword = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      const { currentPassword, newPassword } = req.body

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)

      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      // Log password change
      await this.auditLogService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'UPDATE',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      console.error('Change password error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  logout = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        })
      }

      // Log logout activity
      await this.auditLogService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'LOGOUT',
        entity: 'USER',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      console.error('Logout error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
