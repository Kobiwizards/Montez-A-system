"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maintenance_controller_1 = require("../controllers/maintenance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const file_service_1 = require("../services/file.service");
const router = (0, express_1.Router)();
const maintenanceController = new maintenance_controller_1.MaintenanceController();
const fileService = new file_service_1.FileService();
const upload = fileService.getMulterConfig();
// Tenant routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), upload.array('images', 5), maintenanceController.createRequest);
router.get('/my-requests', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), maintenanceController.getTenantRequests);
router.get('/:id', auth_middleware_1.authenticate, maintenanceController.getRequestById);
// Admin routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), maintenanceController.getAllRequests);
router.put('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), maintenanceController.updateRequestStatus);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), maintenanceController.updateRequest);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), maintenanceController.deleteRequest);
exports.default = router;
//# sourceMappingURL=maintenance.routes.js.map