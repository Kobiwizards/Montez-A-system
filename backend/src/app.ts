import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import routes from './routes'
import { errorHandler } from './middleware/error.middleware'
import { notFoundHandler } from './middleware/not-found.middleware'
import path from 'path'

export const createApp = () => {
  const app = express()

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }))

  // CORS
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true
  }))

  // Body parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'))
  }

  // Compression
  app.use(compression())

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    })
  )

  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
  app.use('/receipts', express.static(path.join(__dirname, '../receipts')))

  // API routes
  app.use('/api', routes)

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
  })

  // API documentation route
  app.get('/api-docs', (req, res) => {
    res.json({
      name: 'Montez A Property Management API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        tenants: '/api/tenants',
        payments: '/api/payments',
        receipts: '/api/receipts',
        water: '/api/water',
        maintenance: '/api/maintenance',
        analytics: '/api/analytics'
      },
      documentation: 'See README.md for full API documentation'
    })
  })

  // Error handling
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
