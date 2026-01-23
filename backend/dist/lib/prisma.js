"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// For Prisma 7.2.0, you MUST pass an empty object
const prisma = new client_1.PrismaClient({});
exports.prisma = prisma;
