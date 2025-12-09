import { Router } from 'express'
import { PaymentController } from '../controllers/payment.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { FileService } from '../services/file.service'

const router = Router()
const paymentController = new PaymentController()
const fileService = new FileService()

const upload = fileService.getMulterConfig()

// Tenant routes
router.post(
  '/',
  authenticate,
  authorize('TENANT'),
  upload.array('screenshots', 5),
  paymentController.createPayment
)

router.get(
  '/my-payments',
  authenticate,
  authorize('TENANT'),
  paymentController.getTenantPayments
)

// Public routes (for viewing receipts)
router.get('/:id', paymentController.getPaymentById)

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

router.put(
  '/:id/verify',
  authenticate,
  authorize('ADMIN'),
  paymentController.verifyPayment
)

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  paymentController.deletePayment
)

export default router
