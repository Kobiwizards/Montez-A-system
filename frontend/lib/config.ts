// Configuration utility for both local and production

export const config = {
  // API URLs
  api: {
    local: 'http://localhost:3001/api',
    production: 'https://montez-a-system-backend.onrender.com/api',
    // Use production as default if NEXT_PUBLIC_API_URL is not set
    current: process.env.NEXT_PUBLIC_API_URL || 'https://montez-a-system-backend.onrender.com/api'
  },
  
  // App URLs
  app: {
    local: 'http://localhost:3000',
    production: 'https://montez-a.onrender.com',
    current: process.env.NEXT_PUBLIC_APP_URL || 'https://montez-a.onrender.com'
  },
  
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // App info
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Montez A Property Management',
  
  // Feature flags
  features: {
    enableWaterBilling: true,
    enableMaintenanceRequests: true,
    enableReceiptDownloads: true,
    enableEmailNotifications: process.env.NEXT_PUBLIC_ENABLE_EMAIL === 'true'
  },
  
  // URLs for specific endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      profile: '/auth/profile',
      logout: '/auth/logout'
    },
    tenants: '/tenants',
    payments: '/payments',
    receipts: '/receipts',
    water: '/water',
    maintenance: '/maintenance',
    analytics: '/analytics'
  },
  
  // Helper to get full URL for endpoints
  getApiUrl: (endpoint: string): string => {
    const baseUrl = config.api.current
    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    // Ensure endpoint starts with slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${cleanBaseUrl}${cleanEndpoint}`
  },
  
  // Log current config (for debugging)
  logConfig: () => {
    if (typeof window !== 'undefined') {
      console.log('🔧 Current Configuration:')
      console.log('Environment:', process.env.NODE_ENV)
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://montez-a-system-backend.onrender.com/api')
      console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL || 'https://montez-a.onrender.com')
      console.log('Backend:', 'https://montez-a-system-backend.onrender.com')
      console.log('Frontend:', 'https://montez-a.onrender.com')
      console.log('Full Login URL:', config.getApiUrl('/auth/login'))
    }
  }
}

// Auto-log config in development and production (for debugging)
if (typeof window !== 'undefined') {
  // Always log in development, optional in production
  if (process.env.NODE_ENV === 'development') {
    config.logConfig()
  }
  // You can add a condition to log in production if needed
  // else if (window.location.hostname === 'montez-a.onrender.com') {
  //   config.logConfig()
  // }
}