import { Request } from 'express'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export interface AuthRequest extends Request {
  user?: User
  body?: any
  params?: any
  query?: any
  ip?: string
  get?(name: string): string | undefined
  files?: any
}