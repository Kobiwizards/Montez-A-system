// Configuration utility for both local and production

export const config = {
  // API URLs
  api: {
    local: 'http://localhost:3001/api',
    production: 'https://montez-a-system-backend.onrender.com/api',
    current: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  },
  
  // App URLs
  app: {
    local: 'http://localhost:3000',
    production: 'https://montez-a.onrender.com',
    current: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // App info
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Montez A Property Management',
  
  // Log current config (for debugging)
  logConfig: () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('í´§ Current Configuration:')
      console.log('Environment:', process.env.NODE_ENV)
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
      console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL)
      console.log('Backend:', 'https://montez-a-system-backend.onrender.com')
      console.log('Frontend:', 'https://montez-a.onrender.com')
    }
  }
}

// Auto-log config in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  config.logConfig()
}
