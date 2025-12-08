"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_middleware_2 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const analyticsController = new analytics_controller_1.AnalyticsController();
// Admin routes
router.get('/dashboard', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), analyticsController.getDashboardMetrics);
router.get('/financial', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.analyticsSchemas.getMetrics), analyticsController.getFinancialReport);
router.get('/occupancy', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), analyticsController.getOccupancyReport);
router.get('/tenants', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), analyticsController.getTenantReport);
router.get('/water', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), analyticsController.getWaterConsumptionReport);
router.get('/export', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), analyticsController.exportReport);
exports.default = router;
