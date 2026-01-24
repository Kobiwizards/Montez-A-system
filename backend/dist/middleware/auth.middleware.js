"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        // Attach user to request
        req.user = user;
        req.userId = user.id;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        next();
    };
};
exports.authorize = authorize;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: refreshTokenFromBody } = req.body;
        if (!refreshTokenFromBody) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshTokenFromBody, process.env.JWT_REFRESH_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        // Generate new tokens - FIXED: Cast expiresIn to correct type
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
        const newRefreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') });
        res.json({
            success: true,
            data: {
                token,
                refreshToken: newRefreshToken
            }
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
exports.refreshToken = refreshToken;
