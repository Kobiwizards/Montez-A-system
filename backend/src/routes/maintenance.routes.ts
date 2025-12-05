import { Router } from 'express'
import { MaintenanceController } from '../controllers/maintenance.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { FileService } from '../services/file.service'

const router = Router()
const maintenanceController = new MaintenanceController()
const fileService = new FileService()
const upload = fileService.getMulterConfig()

// Tenant routes
router.post(
  '/',
  authenticate,
  authorize('TENANT'),
  upload.array('images', 5),
  maintenanceController.createRequest
)

router.get(
  '/me',
  authenticate,
  authorize('TENANT'),
  maintenanceController.getTenantRequests
)

router.get(
  '/me/:id',
  authenticate,
  authorize('TENANT'),
  maintenanceController.getRequestById
)

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  maintenanceController.getAllRequests
)

router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  maintenanceController.updateRequestStatus
)

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  maintenanceController.updateRequest
)

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  maintenanceController.deleteRequest
)

export default router