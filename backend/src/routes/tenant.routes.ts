import { Router } from 'express'
import { TenantController } from '../controllers/tenant.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { tenantSchemas } from '../middleware/validation.middleware'
import { PrismaClient } from '@prisma/client'

const router = Router()
const tenantController = new TenantController()
const prisma = new PrismaClient()

// ============================================
// PUBLIC TEST ENDPOINTS (For debugging only)
// ============================================

// Public endpoint to test database connection
router.get('/public/test', async (req, res) => {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Get tenant count
    const tenantCount = await prisma.user.count({
      where: { role: 'TENANT' }
    })
    
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
    })
    
    // Get admin count
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })
    
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
    })
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error)
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 30) + '...' : 
        'Not set'
    })
  }
})

// Public endpoint to check if specific user exists
router.get('/public/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params
    
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
    })
    
    res.json({
      success: true,
      exists: !!user,
      user: user,
      message: user ? 'User found' : 'User not found'
    })
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ============================================
// DEBUG ENDPOINTS (Require auth but provide debug info)
// ============================================

// Check current user session
router.get('/debug/me', authenticate, (req, res) => {
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
  })
})

// Test tenant access with current user token
router.get('/debug/my-access', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No user ID in token'
      })
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
    })
    
    res.json({
      success: true,
      user: user,
      canAccessAdminRoutes: user?.role === 'ADMIN',
      canAccessTenantRoutes: user?.role === 'TENANT',
      message: `You are logged in as ${user?.role}`
    })
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ============================================
// ADMIN ROUTES
// ============================================

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  tenantController.getAllTenants
)

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  tenantController.getTenantById
)

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(tenantSchemas.create),
  tenantController.createTenant
)

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(tenantSchemas.update),
  tenantController.updateTenant
)

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  tenantController.deleteTenant
)

router.put(
  '/:id/balance',
  authenticate,
  authorize('ADMIN'),
  tenantController.updateTenantBalance
)

// ============================================
// TENANT ROUTES
// ============================================

router.get(
  '/dashboard/me',
  authenticate,
  authorize('TENANT'),
  tenantController.getTenantDashboard
)

// Tenant profile (read-only access to own data)
router.get(
  '/profile/me',
  authenticate,
  authorize('TENANT'),
  async (req, res) => {
    try {
      const userId = req.user?.userId
      
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
      })
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        })
      }
      
      res.json({
        success: true,
        data: tenant
      })
      
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
)

export default router