"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const file_service_1 = require("../services/file.service");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
const fileService = new file_service_1.FileService();
const upload = fileService.getMulterConfig();
// Tenant routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), upload.array('screenshots', 5), paymentController.createPayment);
router.get('/my-payments', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), paymentController.getTenantPayments);
// Public routes (for viewing receipts)
router.get('/:id', paymentController.getPaymentById);
// Admin routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), paymentController.getAllPayments);
router.get('/pending', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), paymentController.getPendingPayments);
router.put('/:id/verify', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), paymentController.verifyPayment);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), paymentController.deletePayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map