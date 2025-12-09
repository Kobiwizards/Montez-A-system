import { Request } from 'express'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
      files?: any
      ip?: string
      body?: any
      params?: any
      query?: any
      headers?: any
      get?: (name: string) => string | undefined
    }
  }
}

export interface AuthRequest extends Request {
  user?: User
  files?: any
}

export {}
