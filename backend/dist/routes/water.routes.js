"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const water_controller_1 = require("../controllers/water.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_middleware_2 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const waterController = new water_controller_1.WaterController();
// Admin routes
router.get('/readings', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), waterController.getAllReadings);
router.get('/readings/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), waterController.getReadingById);
router.post('/readings', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.waterReadingSchemas.create), waterController.createReading);
router.put('/readings/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.waterReadingSchemas.update), waterController.updateReading);
router.delete('/readings/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), waterController.deleteReading);
router.get('/calculator', auth_middleware_1.authenticate, waterController.calculateWaterBill);
// Tenant routes
router.get('/me/readings', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), waterController.getTenantReadings);
exports.default = router;
//# sourceMappingURL=water.routes.js.map