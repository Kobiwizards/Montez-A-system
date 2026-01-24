"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterController = void 0;
const prisma_1 = require("../lib/prisma");
const audit_service_1 = require("../services/audit.service");
const index_1 = require("../config/index");
class WaterController {
    auditLogService;
    constructor() {
        this.auditLogService = new audit_service_1.AuditLogService();
    }
    getAllReadings = async (req, res) => {
        try {
            const { page = 1, limit = 20, month, paid, tenantId, sortBy = 'month', sortOrder = 'desc', } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            // Build where clause
            const where = {};
            if (month) {
                where.month = month;
            }
            if (paid !== undefined) {
                where.paid = paid === 'true';
            }
            if (tenantId) {
                where.tenantId = tenantId;
            }
            const [readings, total] = await Promise.all([
                prisma_1.prisma.waterReading.findMany({
                    where,
                    skip,
                    take,
                    orderBy: {
                        [sortBy]: sortOrder,
                    },
                    include: {
                        tenant: {
                            select: {
                                id: true,
                                name: true,
                                apartment: true,
                                email: true,
                            },
                        },
                        payment: {
                            select: {
                                id: true,
                                amount: true,
                                status: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.waterReading.count({ where }),
            ]);
            // Calculate totals
            const totals = {
                totalUnits: readings.reduce((sum, r) => sum + r.units, 0),
                totalAmount: readings.reduce((sum, r) => sum + r.amount, 0),
                paidAmount: readings.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0),
                unpaidAmount: readings.filter(r => !r.paid).reduce((sum, r) => sum + r.amount, 0),
            };
            res.status(200).json({
                success: true,
                data: readings,
                totals,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Get all water readings error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    getReadingById = async (req, res) => {
        try {
            const { id } = req.params;
            const reading = await prisma_1.prisma.waterReading.findUnique({
                where: { id },
                include: {
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            apartment: true,
                            email: true,
                            phone: true,
                        },
                    },
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            method: true,
                            createdAt: true,
                        },
                    },
                },
            });
            if (!reading) {
                return res.status(404).json({
                    success: false,
                    message: 'Water reading not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: reading,
            });
        }
        catch (error) {
            console.error('Get water reading by ID error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    createReading = async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required',
                });
            }
            const { tenantId, previousReading, currentReading, month } = req.body;
            // Validate tenant exists
            const tenant = await prisma_1.prisma.user.findUnique({
                where: { id: tenantId },
            });
            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant not found',
                });
            }
            // Validate readings
            if (currentReading < previousReading) {
                return res.status(400).json({
                    success: false,
                    message: 'Current reading must be greater than previous reading',
                });
            }
            const units = currentReading - previousReading;
            const amount = units * index_1.config.waterRatePerUnit;
            // Check if reading already exists for this month
            const existingReading = await prisma_1.prisma.waterReading.findFirst({
                where: {
                    tenantId,
                    month,
                },
            });
            if (existingReading) {
                return res.status(400).json({
                    success: false,
                    message: 'Water reading already exists for this month',
                });
            }
            // Create reading
            const reading = await prisma_1.prisma.waterReading.create({
                data: {
                    tenantId,
                    previousReading,
                    currentReading,
                    units,
                    rate: index_1.config.waterRatePerUnit,
                    amount,
                    month,
                    year: parseInt(month.split('-')[0]),
                    paid: false,
                },
            });
            // Update tenant balance
            const newBalance = tenant.balance + amount;
            await prisma_1.prisma.user.update({
                where: { id: tenantId },
                data: {
                    balance: newBalance,
                    status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
                },
            });
            // Log creation
            await this.auditLogService.log({
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'CREATE',
                entity: 'WATER_READING',
                entityId: reading.id,
                newData: {
                    tenantId,
                    month,
                    units,
                    amount,
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            return res.status(201).json({
                success: true,
                message: 'Water reading created successfully',
                data: reading,
            });
        }
        catch (error) {
            console.error('Create water reading error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    updateReading = async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required',
                });
            }
            const { id } = req.params;
            const { previousReading, currentReading } = req.body;
            // Get existing reading
            const existingReading = await prisma_1.prisma.waterReading.findUnique({
                where: { id },
                include: {
                    tenant: true,
                },
            });
            if (!existingReading) {
                return res.status(404).json({
                    success: false,
                    message: 'Water reading not found',
                });
            }
            // Validate readings
            if (currentReading && previousReading && currentReading < previousReading) {
                return res.status(400).json({
                    success: false,
                    message: 'Current reading must be greater than previous reading',
                });
            }
            // Calculate new values
            const newPreviousReading = previousReading ?? existingReading.previousReading;
            const newCurrentReading = currentReading ?? existingReading.currentReading;
            const newUnits = newCurrentReading - newPreviousReading;
            const newAmount = newUnits * index_1.config.waterRatePerUnit;
            // Calculate difference in amount
            const amountDifference = newAmount - existingReading.amount;
            // Update reading
            const reading = await prisma_1.prisma.waterReading.update({
                where: { id },
                data: {
                    previousReading: newPreviousReading,
                    currentReading: newCurrentReading,
                    units: newUnits,
                    amount: newAmount,
                },
            });
            // Update tenant balance if amount changed
            if (amountDifference !== 0) {
                const newBalance = existingReading.tenant.balance + amountDifference;
                await prisma_1.prisma.user.update({
                    where: { id: existingReading.tenantId },
                    data: {
                        balance: newBalance,
                        status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
                    },
                });
            }
            // Log update
            await this.auditLogService.log({
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'UPDATE',
                entity: 'WATER_READING',
                entityId: reading.id,
                oldData: {
                    previousReading: existingReading.previousReading,
                    currentReading: existingReading.currentReading,
                    units: existingReading.units,
                    amount: existingReading.amount,
                },
                newData: {
                    previousReading: newPreviousReading,
                    currentReading: newCurrentReading,
                    units: newUnits,
                    amount: newAmount,
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            return res.status(200).json({
                success: true,
                message: 'Water reading updated successfully',
                data: reading,
            });
        }
        catch (error) {
            console.error('Update water reading error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    deleteReading = async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required',
                });
            }
            const { id } = req.params;
            // Get existing reading
            const existingReading = await prisma_1.prisma.waterReading.findUnique({
                where: { id },
                include: {
                    tenant: true,
                    payment: true,
                },
            });
            if (!existingReading) {
                return res.status(404).json({
                    success: false,
                    message: 'Water reading not found',
                });
            }
            // Can't delete if already paid
            if (existingReading.paid) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete paid water reading',
                });
            }
            // Update tenant balance (remove the amount)
            const newBalance = existingReading.tenant.balance - existingReading.amount;
            await prisma_1.prisma.user.update({
                where: { id: existingReading.tenantId },
                data: {
                    balance: newBalance,
                    status: newBalance > 0 ? 'OVERDUE' : 'CURRENT',
                },
            });
            // Delete reading
            await prisma_1.prisma.waterReading.delete({
                where: { id },
            });
            // Log deletion
            await this.auditLogService.log({
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'DELETE',
                entity: 'WATER_READING',
                entityId: existingReading.id,
                oldData: existingReading,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
            return res.status(200).json({
                success: true,
                message: 'Water reading deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete water reading error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    getTenantReadings = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated',
                });
            }
            const { page = 1, limit = 20, paid, startDate, endDate } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            // Build where clause
            const where = { tenantId: req.user.id };
            if (paid !== undefined) {
                where.paid = paid === 'true';
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = new Date(startDate);
                if (endDate)
                    where.createdAt.lte = new Date(endDate);
            }
            const [readings, total] = await Promise.all([
                prisma_1.prisma.waterReading.findMany({
                    where,
                    skip,
                    take,
                    orderBy: { month: 'desc' },
                    include: {
                        payment: {
                            select: {
                                id: true,
                                status: true,
                                createdAt: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.waterReading.count({ where }),
            ]);
            // Calculate summary
            const summary = {
                totalReadings: total,
                totalUnits: readings.reduce((sum, r) => sum + r.units, 0),
                totalAmount: readings.reduce((sum, r) => sum + r.amount, 0),
                paidAmount: readings.filter(r => r.paid).reduce((sum, r) => sum + r.amount, 0),
                unpaidAmount: readings.filter(r => !r.paid).reduce((sum, r) => sum + r.amount, 0),
                averageUnits: readings.length > 0
                    ? readings.reduce((sum, r) => sum + r.units, 0) / readings.length
                    : 0,
            };
            return res.status(200).json({
                success: true,
                data: readings,
                summary,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Get tenant water readings error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    calculateWaterBill = async (req, res) => {
        try {
            const { units, rate } = req.query;
            const unitsNum = parseFloat(units) || 0;
            const rateNum = parseFloat(rate) || index_1.config.waterRatePerUnit;
            const amount = unitsNum * rateNum;
            res.status(200).json({
                success: true,
                data: {
                    units: unitsNum,
                    rate: rateNum,
                    amount,
                    calculation: `${unitsNum} units × KSh ${rateNum} = KSh ${amount}`,
                },
            });
        }
        catch (error) {
            console.error('Calculate water bill error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
}
exports.WaterController = WaterController;
