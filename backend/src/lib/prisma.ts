import { PrismaClient } from '@prisma/client'

// For Prisma 7.2.0, you MUST pass an empty object
const prisma = new PrismaClient({})
export { prisma }
