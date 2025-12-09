import { Router } from 'express'
import { ReceiptController } from '../controllers/receipt.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = Router()
const receiptController = new ReceiptController()

// Public routes (with authentication)
router.get(
  '/:id',
  authenticate,
  receiptController.getReceiptById
)

router.get(
  '/:id/download',
  authenticate,
  receiptController.downloadReceipt
)

// Admin routes
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  receiptController.getAllReceipts
)

router.post(
  '/generate/:paymentId',
  authenticate,
  authorize('ADMIN'),
  receiptController.generateReceipt
)

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  receiptController.deleteReceipt
)

// Tenant routes
router.get(
  '/me/history',
  authenticate,
  authorize('TENANT'),
  receiptController.getTenantReceipts
)

export default router