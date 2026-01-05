import { Request } from 'express'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
      files?: any
    }
  }
}

// Extend AuthRequest to include all Express Request properties
export interface AuthRequest extends Request {
  user?: User
}