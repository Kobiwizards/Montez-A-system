import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { analyticsSchemas } from '../middleware/validation.middleware'

const router = Router()
const analyticsController = new AnalyticsController()

// Admin routes
router.get(
  '/dashboard',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getDashboardMetrics
)

router.get(
  '/financial',
  authenticate,
  authorize('ADMIN'),
  validate(analyticsSchemas.getMetrics),
  analyticsController.getFinancialReport
)

router.get(
  '/occupancy',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getOccupancyReport
)

router.get(
  '/tenants',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getTenantReport
)

router.get(
  '/water',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getWaterConsumptionReport
)

// New report generation endpoint (POST for sending report parameters in body)
router.post(
  '/report',
  authenticate,
  authorize('ADMIN'),
  analyticsController.generateReport
)

router.get(
  '/export',
  authenticate,
  authorize('ADMIN'),
  analyticsController.exportReport
)

export default router