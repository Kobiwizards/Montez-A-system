import { Request } from 'express'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
      // Remove files declaration - conflicts with multer types
    }
  }
}

export interface AuthRequest extends Request {
  user?: User
}