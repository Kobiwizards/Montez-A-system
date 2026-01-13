"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// For Prisma 7.2.0, you don't pass datasourceUrl to PrismaClient constructor
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const prisma = globalThis.prisma ?? prismaClientSingleton();
exports.prisma = prisma;
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
