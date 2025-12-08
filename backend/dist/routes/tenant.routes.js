"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenant_controller_1 = require("../controllers/tenant.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_middleware_2 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const tenantController = new tenant_controller_1.TenantController();
// Admin routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.getAllTenants);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.getTenantById);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.tenantSchemas.create), tenantController.createTenant);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.tenantSchemas.update), tenantController.updateTenant);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.deleteTenant);
router.put('/:id/balance', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.updateTenantBalance);
// Tenant routes
router.get('/dashboard/me', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), tenantController.getTenantDashboard);
exports.default = router;
