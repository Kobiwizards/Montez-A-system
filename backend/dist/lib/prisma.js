"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
// Middleware for logging
exports.prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
});
// Error handling middleware
exports.prisma.$use(async (params, next) => {
    try {
        return await next(params);
    }
    catch (error) {
        console.error('Prisma error:', {
            model: params.model,
            action: params.action,
            args: params.args,
            error: error instanceof Error ? error.message : error,
        });
        throw error;
    }
});
exports.default = exports.prisma;
