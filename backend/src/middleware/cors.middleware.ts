import cors from 'cors'

// Allow both local development and production URLs
const allowedOrigins = [
  'http://localhost:3000',  // Local frontend
  'https://montez-a.onrender.com',  // Production frontend
  'https://montez-a-system.onrender.com',  // Alternative frontend
  'https://montez-a-system-backend.onrender.com'  // Allow backend-to-backend if needed
]

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // For development/testing, log all origins
    console.log(`CORS check for origin: ${origin}`);
    
    // Allow all origins for now to fix the issue
    // TODO: Restrict to specific origins in production
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        console.log('Blocked by CORS:', origin)
        callback(new Error('Not allowed by CORS'))
      }
    } else {
      // Allow all in development/testing
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
})
