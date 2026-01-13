import { PrismaClient } from '@prisma/client'

// For Prisma 7.2.0, you don't pass datasourceUrl to PrismaClient constructor
const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}