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

export interface AuthRequest extends Request {
  user?: User
  files?: any
}

export {}
