import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') })

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Montez A Property Management',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@monteza.com'
  },

  // For backward compatibility (direct access)
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT || '587'),
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@monteza.com',

  // File uploads
  uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
  receiptsPath: process.env.RECEIPTS_PATH || path.join(__dirname, '../../receipts'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000', // For backward compatibility

  // Water rate
  waterRatePerUnit: parseInt(process.env.WATER_RATE_PER_UNIT || '150'),

  // Rent amounts
  oneBedroomRent: parseInt(process.env.ONE_BEDROOM_RENT || '15000'),
  twoBedroomRent: parseInt(process.env.TWO_BEDROOM_RENT || '18000'),

  // Analytics
  analyticsSnapshotHour: parseInt(process.env.ANALYTICS_SNAPSHOT_HOUR || '23'), // 11 PM
}

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Warning: ${envVar} is not set in environment variables`)
  }
}

export default config
