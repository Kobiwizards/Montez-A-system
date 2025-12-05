import { Router } from 'express'
import authRoutes from './auth.routes'
import tenantRoutes from './tenant.routes'
import paymentRoutes from './payment.routes'
import receiptRoutes from './receipt.routes'
import analyticsRoutes from './analytics.routes'
import waterRoutes from './water.routes'
import maintenanceRoutes from './maintenance.routes'

const router = Router()

// API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Montez A Property Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tenants: '/api/tenants',
      payments: '/api/payments',
      receipts: '/api/receipts',
      analytics: '/api/analytics',
      water: '/api/water',
      maintenance: '/api/maintenance',
    },
    documentation: 'Add Swagger/OpenAPI documentation here',
  })
})

// Mount route modules
router.use('/auth', authRoutes)
router.use('/tenants', tenantRoutes)
router.use('/payments', paymentRoutes)
router.use('/receipts', receiptRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/water', waterRoutes)
router.use('/maintenance', maintenanceRoutes)

export default router