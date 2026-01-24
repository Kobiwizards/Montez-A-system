import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { User } from '@prisma/client'

// Define authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: User
  userId?: string
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Attach user to request
    req.user = user
    req.userId = user.id
    
    next()
  } catch (error: any) {
    console.error('Authentication error:', error.message)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    next()
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Generate new tokens
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    )

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken
      }
    })
  } catch (error: any) {
    console.error('Refresh token error:', error.message)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
}