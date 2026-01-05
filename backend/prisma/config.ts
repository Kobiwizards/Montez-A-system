import { defineDatasource } from '@prisma/client'

export default defineDatasource({
  url: process.env.DATABASE_URL,
})