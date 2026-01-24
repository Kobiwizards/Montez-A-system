// This file augments the Express types globally
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
      userId?: string
    }
  }
}
