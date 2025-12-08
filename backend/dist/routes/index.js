"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const tenant_routes_1 = __importDefault(require("./tenant.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const receipt_routes_1 = __importDefault(require("./receipt.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const water_routes_1 = __importDefault(require("./water.routes"));
const maintenance_routes_1 = __importDefault(require("./maintenance.routes"));
const router = (0, express_1.Router)();
// API Documentation
router.get('/', (_req, res) => {
    res.json({
        message: 'Montez A Property Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tenants: '/api/tenants',
            payments: '/api/payments',
            receipts: '/api/receipts',
            analytics: '/api/analytics',
            water: '/api/water',
            maintenance: '/api/maintenance',
        },
        documentation: 'Coming soon...',
    });
});
// Mount routes
router.use('/auth', auth_routes_1.default);
router.use('/tenants', tenant_routes_1.default);
router.use('/payments', payment_routes_1.default);
router.use('/receipts', receipt_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/water', water_routes_1.default);
router.use('/maintenance', maintenance_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map