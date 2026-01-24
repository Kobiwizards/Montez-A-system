import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { AuditService } from '../services/audit.service'

export class AuthController {
  private auditService: AuditService

  constructor() {
    this.auditService = new AuditService()
  }

  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        })
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      // Generate tokens
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      )

      // Prepare user response (without password)
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        apartment: user.apartment,
        unitType: user.unitType,
        rentAmount: user.rentAmount,
        waterRate: user.waterRate,
        balance: user.balance,
        status: user.status,
        moveInDate: user.moveInDate,
        leaseEndDate: user.leaseEndDate,
        emergencyContact: user.emergencyContact,
        idCopyUrl: user.idCopyUrl,
        contractUrl: user.contractUrl,
        createdAt: user.createdAt
      }

      // Log login action
      await this.auditService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      })

      res.json({
        success: true,
        data: {
          token,
          refreshToken,
          user: userResponse
        }
      })

    } catch (error: any) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  public getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        })
      }

      // Return user profile (without password)
      const userResponse = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        phone: req.user.phone,
        role: req.user.role,
        apartment: req.user.apartment,
        unitType: req.user.unitType,
        rentAmount: req.user.rentAmount,
        waterRate: req.user.waterRate,
        balance: req.user.balance,
        status: req.user.status,
        moveInDate: req.user.moveInDate,
        leaseEndDate: req.user.leaseEndDate,
        emergencyContact: req.user.emergencyContact,
        idCopyUrl: req.user.idCopyUrl,
        contractUrl: req.user.contractUrl,
        createdAt: req.user.createdAt
      }

      res.json({
        success: true,
        data: userResponse
      })

    } catch (error: any) {
      console.error('Get profile error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  public updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        })
      }

      const { name, phone, emergencyContact } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name || req.user.name,
          phone: phone || req.user.phone,
          emergencyContact: emergencyContact || req.user.emergencyContact
        }
      })

      // Log update action
      await this.auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'UPDATE',
        entity: 'USER',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      })

      // Return updated user (without password)
      const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        apartment: updatedUser.apartment,
        unitType: updatedUser.unitType,
        rentAmount: updatedUser.rentAmount,
        waterRate: updatedUser.waterRate,
        balance: updatedUser.balance,
        status: updatedUser.status,
        moveInDate: updatedUser.moveInDate,
        leaseEndDate: updatedUser.leaseEndDate,
        emergencyContact: updatedUser.emergencyContact,
        idCopyUrl: updatedUser.idCopyUrl,
        contractUrl: updatedUser.contractUrl,
        createdAt: updatedUser.createdAt
      }

      res.json({
        success: true,
        data: userResponse,
        message: 'Profile updated successfully'
      })

    } catch (error: any) {
      console.error('Update profile error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  public changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        })
      }

      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        })
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, req.user.password)

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      })

      // Log password change
      await this.auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'CHANGE_PASSWORD',
        entity: 'USER',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      })

      res.json({
        success: true,
        message: 'Password changed successfully'
      })

    } catch (error: any) {
      console.error('Change password error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  public logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user) {
        // Log logout action
        await this.auditService.log({
          userId: req.user.id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action: 'LOGOUT',
          entity: 'USER',
          entityId: req.user.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        })
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      })

    } catch (error: any) {
      console.error('Logout error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  public register = async (req: Request, res: Response) => {
    try {
      // This would be for admin creating tenants
      // For now, return not implemented
      res.status(501).json({
        success: false,
        message: 'Registration is not implemented. Use admin panel to create tenants.'
      })

    } catch (error: any) {
      console.error('Register error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}