import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate, refreshToken } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { authSchemas } from '../middleware/validation.middleware'

const router = Router()
const authController = new AuthController()

// Public routes
router.post('/login', validate(authSchemas.login), authController.login)
router.post('/register', validate(authSchemas.register), authController.register)
router.post('/refresh-token', refreshToken)

// Protected routes
router.get('/profile', authenticate, authController.getProfile)
router.put('/profile', authenticate, authController.updateProfile)
router.put('/change-password', authenticate, authController.changePassword)
router.post('/logout', authenticate, authController.logout)

export default router