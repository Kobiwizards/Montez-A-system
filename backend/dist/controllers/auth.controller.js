"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const audit_service_1 = require("../services/audit.service");
// JWT Configuration with proper types
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-key-change-in-production';
// Convert string expiresIn to proper type
const getJwtExpiresIn = () => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    // Convert string like "7d" to seconds if needed
    if (expiresIn.endsWith('d')) {
        const days = parseInt(expiresIn);
        return days * 24 * 60 * 60; // Convert days to seconds
    }
    if (expiresIn.endsWith('h')) {
        const hours = parseInt(expiresIn);
        return hours * 60 * 60; // Convert hours to seconds
    }
    return expiresIn; // Return as-is if it's already in seconds format
};
const getRefreshExpiresIn = () => {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    if (expiresIn.endsWith('d')) {
        const days = parseInt(expiresIn);
        return days * 24 * 60 * 60;
    }
    return expiresIn;
};
// Or simpler: use string values directly (jwt accepts strings)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
class AuthController {
    auditService;
    constructor() {
        this.auditService = new audit_service_1.AuditLogService();
    }
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            // Find user
            const user = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            // Generate tokens - FIXED: Cast expiresIn to correct type
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
            // Prepare user response (without password)
            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                apartment: user.apartment,
                unitType: user.unitType,
                rentAmount: user.rentAmount,
                waterRate: user.waterRate,
                balance: user.balance,
                status: user.status,
                moveInDate: user.moveInDate,
                leaseEndDate: user.leaseEndDate,
                emergencyContact: user.emergencyContact,
                idCopyUrl: user.idCopyUrl,
                contractUrl: user.contractUrl,
                createdAt: user.createdAt
            };
            // Log login action
            await this.auditService.log({
                userId: user.id,
                userEmail: user.email,
                userRole: user.role,
                action: 'LOGIN',
                entity: 'USER',
                entityId: user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            // Return consistent format with success: true
            res.json({
                success: true,
                token,
                refreshToken,
                user: userResponse
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
    refreshToken = async (req, res) => {
        try {
            const { refreshToken: refreshTokenFromBody } = req.body;
            if (!refreshTokenFromBody) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token required'
                });
            }
            const decoded = jsonwebtoken_1.default.verify(refreshTokenFromBody, JWT_REFRESH_SECRET);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            // Generate new tokens - FIXED: Cast expiresIn
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            const newRefreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
            res.json({
                success: true,
                token,
                refreshToken: newRefreshToken
            });
        }
        catch (error) {
            console.error('Refresh token error:', error.message);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    };
    getProfile = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            // Return user profile (without password)
            const userResponse = {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                phone: req.user.phone,
                role: req.user.role,
                apartment: req.user.apartment,
                unitType: req.user.unitType,
                rentAmount: req.user.rentAmount,
                waterRate: req.user.waterRate,
                balance: req.user.balance,
                status: req.user.status,
                moveInDate: req.user.moveInDate,
                leaseEndDate: req.user.leaseEndDate,
                emergencyContact: req.user.emergencyContact,
                idCopyUrl: req.user.idCopyUrl,
                contractUrl: req.user.contractUrl,
                createdAt: req.user.createdAt
            };
            res.json({
                success: true,
                data: userResponse
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
    updateProfile = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const { name, phone, emergencyContact } = req.body;
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: {
                    name: name || req.user.name,
                    phone: phone || req.user.phone,
                    emergencyContact: emergencyContact || req.user.emergencyContact
                }
            });
            // Log update action
            await this.auditService.log({
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'UPDATE',
                entity: 'USER',
                entityId: req.user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            // Return updated user (without password)
            const userResponse = {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
                role: updatedUser.role,
                apartment: updatedUser.apartment,
                unitType: updatedUser.unitType,
                rentAmount: updatedUser.rentAmount,
                waterRate: updatedUser.waterRate,
                balance: updatedUser.balance,
                status: updatedUser.status,
                moveInDate: updatedUser.moveInDate,
                leaseEndDate: updatedUser.leaseEndDate,
                emergencyContact: updatedUser.emergencyContact,
                idCopyUrl: updatedUser.idCopyUrl,
                contractUrl: updatedUser.contractUrl,
                createdAt: updatedUser.createdAt
            };
            res.json({
                success: true,
                data: userResponse,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
    changePassword = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }
            // Verify current password
            const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, req.user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            // Hash new password
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: { password: hashedPassword }
            });
            // Log password change
            await this.auditService.log({
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'CHANGE_PASSWORD',
                entity: 'USER',
                entityId: req.user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
    logout = async (req, res) => {
        try {
            if (req.user) {
                // Log logout action
                await this.auditService.log({
                    userId: req.user.id,
                    userEmail: req.user.email,
                    userRole: req.user.role,
                    action: 'LOGOUT',
                    entity: 'USER',
                    entityId: req.user.id,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent')
                });
            }
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
    register = async (req, res) => {
        try {
            // This would be for admin creating tenants
            // For now, return not implemented
            res.status(501).json({
                success: false,
                message: 'Registration is not implemented. Use admin panel to create tenants.'
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
    verifyToken = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            res.json({
                success: true,
                message: 'Token is valid',
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    role: req.user.role,
                    apartment: req.user.apartment
                }
            });
        }
        catch (error) {
            console.error('Verify token error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}
exports.AuthController = AuthController;
