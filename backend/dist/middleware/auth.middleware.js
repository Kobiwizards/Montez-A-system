"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../config/index");
const prisma_1 = require("../lib/prisma");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, index_1.config.jwtSecret);
            // Verify user still exists and is active
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true, apartment: true, status: true }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found.'
                });
            }
            if (user.role === 'TENANT' && user.status !== 'CURRENT') {
                return res.status(403).json({
                    success: false,
                    message: 'Account is not active.'
                });
            }
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                apartment: user.apartment === 'ADMIN' ? undefined : user.apartment
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired.'
                });
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token.'
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions.'
            });
        }
        next();
    };
};
exports.authorize = authorize;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required.'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, index_1.config.refreshTokenSecret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, apartment: true }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            apartment: user.apartment === 'ADMIN' ? undefined : user.apartment
        }, index_1.config.jwtSecret, { expiresIn: '24h' } // Fixed: Use string literal
        );
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, index_1.config.refreshTokenSecret, { expiresIn: '7d' } // Fixed: Use string literal
        );
        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                apartment: user.apartment === 'ADMIN' ? undefined : user.apartment
            }
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token has expired.'
            });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
        }
        console.error('Token refresh error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=auth.middleware.js.map