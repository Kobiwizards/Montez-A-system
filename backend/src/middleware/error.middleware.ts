import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  })

  // Default error response
  let statusCode = 500
  let message = 'Internal server error'
  let errors: any[] | undefined

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } 
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma errors
    statusCode = 400
    
    switch (err.code) {
      case 'P2002':
        message = 'A record with this value already exists'
        break
      case 'P2025':
        message = 'Record not found'
        break
      case 'P2003':
        message = 'Foreign key constraint failed'
        break
      default:
        message = 'Database error occurred'
    }
  } 
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Invalid data provided'
  } 
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400
    message = 'Invalid JSON payload'
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error'
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  })
}