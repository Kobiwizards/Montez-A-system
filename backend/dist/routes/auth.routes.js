"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_middleware_2 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Public routes
router.post('/login', (0, validation_middleware_1.validate)(validation_middleware_2.authSchemas.login), authController.login);
router.post('/register', (0, validation_middleware_1.validate)(validation_middleware_2.authSchemas.register), authController.register);
router.post('/refresh-token', auth_middleware_1.refreshToken);
// Protected routes
router.get('/profile', auth_middleware_1.authenticate, authController.getProfile);
router.put('/profile', auth_middleware_1.authenticate, authController.updateProfile);
router.put('/change-password', auth_middleware_1.authenticate, authController.changePassword);
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map