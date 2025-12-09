import { Router } from 'express'
import { TenantController } from '../controllers/tenant.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { tenantSchemas } from '../middleware/validation.middleware'

const router = Router()
const tenantController = new TenantController()

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  tenantController.getAllTenants
)

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  tenantController.getTenantById
)

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(tenantSchemas.create),
  tenantController.createTenant
)

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(tenantSchemas.update),
  tenantController.updateTenant
)

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  tenantController.deleteTenant
)

router.put(
  '/:id/balance',
  authenticate,
  authorize('ADMIN'),
  tenantController.updateTenantBalance
)

// Tenant routes
router.get(
  '/dashboard/me',
  authenticate,
  authorize('TENANT'),
  tenantController.getTenantDashboard
)

export default router