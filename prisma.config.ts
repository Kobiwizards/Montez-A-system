import { defineConfig } from '@prisma/client'

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
  migrations: {
    seed: {
      exec: 'tsx prisma/seed.ts',
    },
  },
})