import { AuthRequest } from '../types/express'
import cors from 'cors'

// Allow both local development and production URLs
const allowedOrigins = [
  'http://localhost:3000',  // Local frontend
  'https://montez-a.onrender.com',  // Production frontend
  'https://montez-a-system-backend.onrender.com'  // Allow backend-to-backend if needed
]

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log('Blocked by CORS:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
})
