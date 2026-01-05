"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma_1 = require("../lib/prisma");
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                apartment: true,
                unitType: true,
                rentAmount: true,
                balance: true,
                status: true,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Add user to request
        ;
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Refresh token middleware
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'No refresh token provided',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwtSecret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }
        // Generate new tokens - FIXED: Use string literals for expiresIn
        const newToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            apartment: user.apartment,
        }, config_1.config.jwtSecret, { expiresIn: '7d' } // Fixed: Use string literal directly
        );
        const newRefreshToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, config_1.config.jwtSecret, { expiresIn: '30d' } // Fixed: Use string literal directly
        );
        req.user = user;
        req.tokens = {
            token: newToken,
            refreshToken: newRefreshToken,
        };
        next();
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
};
exports.refreshToken = refreshToken;
