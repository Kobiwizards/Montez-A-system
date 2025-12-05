import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Middleware for logging
prisma.$use(async (params, next) => {
  const before = Date.now()
  
  const result = await next(params)
  
  const after = Date.now()
  
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  
  return result
})

// Error handling middleware
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (error) {
    console.error('Prisma error:', {
      model: params.model,
      action: params.action,
      args: params.args,
      error: error instanceof Error ? error.message : error,
    })
    throw error
  }
})

export default prisma