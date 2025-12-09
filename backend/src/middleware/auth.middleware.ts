import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { prisma } from '../lib/prisma'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      })
      return
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string
      email: string
      role: string
      apartment?: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        apartment: true,
        unitType: true,
        rentAmount: true,
        balance: true,
        status: true,
      },
    })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    // Add user to request
    ;(req as any).user = user

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}

export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      })
      return
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      })
      return
    }

    next()
  }
}

// Refresh token middleware
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      })
      return
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
      id: string
      email: string
      role: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
      return
    }

    // Generate new tokens - FIXED: Use string literals for expiresIn
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        apartment: user.apartment,
      },
      config.jwtSecret,
      { expiresIn: '7d' }  // Fixed: Use string literal directly
    )

    const newRefreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '30d' }  // Fixed: Use string literal directly
    )

    ;(req as any).user = user
    ;(req as any).tokens = {
      token: newToken,
      refreshToken: newRefreshToken,
    }

    next()
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
}