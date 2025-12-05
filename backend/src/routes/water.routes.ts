import { Router } from 'express'
import { WaterController } from '../controllers/water.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { waterReadingSchemas } from '../middleware/validation.middleware'

const router = Router()
const waterController = new WaterController()

// Admin routes
router.get(
  '/readings',
  authenticate,
  authorize('ADMIN'),
  waterController.getAllReadings
)

router.get(
  '/readings/:id',
  authenticate,
  authorize('ADMIN'),
  waterController.getReadingById
)

router.post(
  '/readings',
  authenticate,
  authorize('ADMIN'),
  validate(waterReadingSchemas.create),
  waterController.createReading
)

router.put(
  '/readings/:id',
  authenticate,
  authorize('ADMIN'),
  validate(waterReadingSchemas.update),
  waterController.updateReading
)

router.delete(
  '/readings/:id',
  authenticate,
  authorize('ADMIN'),
  waterController.deleteReading
)

router.get(
  '/calculator',
  authenticate,
  waterController.calculateWaterBill
)

// Tenant routes
router.get(
  '/me/readings',
  authenticate,
  authorize('TENANT'),
  waterController.getTenantReadings
)

export default router