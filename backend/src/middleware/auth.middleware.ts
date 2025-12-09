import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/index'
import { prisma } from '../lib/prisma'

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
        apartment?: string
      }
    }
  }
}

// Keep AuthRequest for backward compatibility
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    apartment?: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string
        email: string
        role: string
        apartment?: string
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, apartment: true, status: true }
      })

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found.' 
        })
      }

      if (user.role === 'TENANT' && user.status !== 'CURRENT') {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is not active.' 
        })
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        apartment: user.apartment === 'ADMIN' ? undefined : user.apartment
      }

      next()
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired.' 
        })
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token.' 
        })
      }
      
      throw error
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions.' 
      })
    }

    next()
  }
}

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token is required.' 
      })
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
      id: string
      email: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, apartment: true }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token.' 
      })
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        apartment: user.apartment === 'ADMIN' ? undefined : user.apartment
      },
      config.jwtSecret,
      { expiresIn: '24h' } // Fixed: Use string literal
    )

    const newRefreshToken = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' } // Fixed: Use string literal
    )

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        apartment: user.apartment === 'ADMIN' ? undefined : user.apartment
      }
    })

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token has expired.' 
      })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token.' 
      })
    }

    console.error('Token refresh error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    })
  }
}
