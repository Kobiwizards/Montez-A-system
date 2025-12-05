import { Router } from 'express'
import { PaymentController } from '../controllers/payment.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { paymentSchemas } from '../middleware/validation.middleware'
import { FileService } from '../services/file.service'

const router = Router()
const paymentController = new PaymentController()
const fileService = new FileService()
const upload = fileService.getMulterConfig()

// Public routes (for tenant payments with authentication)
router.post(
  '/',
  authenticate,
  authorize('TENANT'),
  upload.array('screenshots', 5),
  validate(paymentSchemas.create),
  paymentController.createPayment
)

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  paymentController.getAllPayments
)

router.get(
  '/pending',
  authenticate,
  authorize('ADMIN'),
  paymentController.getPendingPayments
)

router.get(
  '/:id',
  authenticate,
  paymentController.getPaymentById
)

router.put(
  '/:id/verify',
  authenticate,
  authorize('ADMIN'),
  validate(paymentSchemas.verify),
  paymentController.verifyPayment
)

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  paymentController.deletePayment
)

// Tenant routes
router.get(
  '/me/history',
  authenticate,
  authorize('TENANT'),
  paymentController.getTenantPayments
)

export default router