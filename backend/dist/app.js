"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const cors_middleware_1 = require("./middleware/cors.middleware"); // ADD THIS
const path_1 = __importDefault(require("path"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                imgSrc: ["'self'", "data:", "https:"]
            }
        }
    }));
    // ✅ USE YOUR CUSTOM CORS MIDDLEWARE (instead of the default one)
    app.use(cors_middleware_1.corsMiddleware);
    // Body parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Logging
    if (process.env.NODE_ENV !== 'test') {
        app.use((0, morgan_1.default)('combined'));
    }
    // Compression
    app.use((0, compression_1.default)());
    // Rate limiting
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    }));
    // Serve static files
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
    app.use('/receipts', express_1.default.static(path_1.default.join(__dirname, '../receipts')));
    // API routes
    app.use('/api', routes_1.default);
    // Health check
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    // API documentation route
    app.get('/api-docs', (req, res) => {
        res.json({
            name: 'Montez A Property Management API',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                tenants: '/api/tenants',
                payments: '/api/payments',
                receipts: '/api/receipts',
                water: '/api/water',
                maintenance: '/api/maintenance',
                analytics: '/api/analytics'
            },
            documentation: 'See README.md for full API documentation'
        });
    });
    // Error handling
    app.use(not_found_middleware_1.notFoundHandler);
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
