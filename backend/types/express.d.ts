// Type declaration file - do not import this directly
// This augments the Express types globally

import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
      userId?: string
    }
  }
}

// Ensure this file doesn't export anything that could be imported
export {}
