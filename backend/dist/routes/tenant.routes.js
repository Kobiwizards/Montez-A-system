"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenant_controller_1 = require("../controllers/tenant.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_middleware_2 = require("../middleware/validation.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const tenantController = new tenant_controller_1.TenantController();
const prisma = new client_1.PrismaClient();
// ============================================
// PUBLIC TEST ENDPOINTS (For debugging only)
// ============================================
// Public endpoint to test database connection
router.get('/public/test', async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');
        // Test database connection
        await prisma.$queryRaw `SELECT 1`;
        console.log('✅ Database connection successful');
        // Get tenant count
        const tenantCount = await prisma.user.count({
            where: { role: 'TENANT' }
        });
        // Get sample tenants
        const tenants = await prisma.user.findMany({
            where: { role: 'TENANT' },
            select: {
                id: true,
                name: true,
                email: true,
                apartment: true,
                unitType: true,
                rentAmount: true,
                balance: true,
                status: true,
                moveInDate: true,
                createdAt: true
            },
            orderBy: { apartment: 'asc' },
            take: 5
        });
        // Get admin count
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' }
        });
        res.json({
            success: true,
            message: 'Database connection test successful',
            statistics: {
                totalTenants: tenantCount,
                totalAdmins: adminCount,
                sampleCount: tenants.length
            },
            sampleTenants: tenants,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Database test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
            databaseUrl: process.env.DATABASE_URL ?
                process.env.DATABASE_URL.substring(0, 30) + '...' :
                'Not set'
        });
    }
});
// Public endpoint to check if specific user exists
router.get('/public/check-user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                apartment: true,
                status: true,
                createdAt: true
            }
        });
        res.json({
            success: true,
            exists: !!user,
            user: user,
            message: user ? 'User found' : 'User not found'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ============================================
// DEBUG ENDPOINTS (Require auth but provide debug info)
// ============================================
// Check current user session
router.get('/debug/me', auth_middleware_1.authenticate, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        sessionInfo: {
            isAuthenticated: !!req.user,
            role: req.user?.role,
            isAdmin: req.user?.role === 'ADMIN',
            isTenant: req.user?.role === 'TENANT',
            timestamp: new Date().toISOString()
        }
    });
});
// Test tenant access with current user token
router.get('/debug/my-access', auth_middleware_1.authenticate, async (req, res) => {
    try {
        // FIX: Use 'id' instead of 'userId' since your User model has 'id' field
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No user ID in token'
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                apartment: true
            }
        });
        res.json({
            success: true,
            user: user,
            canAccessAdminRoutes: user?.role === 'ADMIN',
            canAccessTenantRoutes: user?.role === 'TENANT',
            message: `You are logged in as ${user?.role}`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ============================================
// ADMIN ROUTES
// ============================================
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.getAllTenants);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.getTenantById);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.tenantSchemas.create), tenantController.createTenant);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validation_middleware_1.validate)(validation_middleware_2.tenantSchemas.update), tenantController.updateTenant);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.deleteTenant);
router.put('/:id/balance', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), tenantController.updateTenantBalance);
// ============================================
// TENANT ROUTES
// ============================================
router.get('/dashboard/me', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), tenantController.getTenantDashboard);
// Tenant profile (read-only access to own data)
router.get('/profile/me', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TENANT'), async (req, res) => {
    try {
        // FIX: Use 'id' instead of 'userId' since your User model has 'id' field
        const userId = req.user?.id;
        const tenant = await prisma.user.findUnique({
            where: {
                id: userId,
                role: 'TENANT'
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                apartment: true,
                unitType: true,
                rentAmount: true,
                waterRate: true,
                balance: true,
                status: true,
                moveInDate: true,
                leaseEndDate: true,
                emergencyContact: true,
                notes: true,
                idCopyUrl: true,
                contractUrl: true,
                createdAt: true
            }
        });
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found'
            });
        }
        res.json({
            success: true,
            data: tenant
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.default = router;
