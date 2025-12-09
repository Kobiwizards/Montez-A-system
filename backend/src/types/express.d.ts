import { Request } from 'express'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface AuthRequest extends Request {
      user?: User
      files?: Express.Multer.File[]
    }
  }
}

export {}
