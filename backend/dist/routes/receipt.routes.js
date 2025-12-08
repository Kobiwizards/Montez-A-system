"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const receipt_controller_1 = require("../controllers/receipt.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const receiptController = new receipt_controller_1.ReceiptController();
// Public routes (with authentication)
router.get('/:id', auth_middleware_1.authenticate, receiptController.getReceiptById);
router.get('/:id/download', auth_middleware_1.authenticate, receiptController.downloadReceipt);
// Admin routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), receiptController.getAllReceipts);
router.post('/generate/:paymentId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), receiptController.generateReceipt);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), receiptController.deleteReceipt);
// Tenant routes
router.get('/me/history', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), receiptController.getTenantReceipts);
exports.default = router;
//# sourceMappingURL=receipt.routes.js.map