import { Request, Response } from 'express'
import { NotFoundError } from './error.middleware'

export const notFoundHandler = (req: Request, res: Response) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`)
}