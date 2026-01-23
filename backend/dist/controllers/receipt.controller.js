"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptController = void 0;
const prisma_1 = require("../lib/prisma");
const receipt_service_1 = require("../services/receipt.service");
const audit_service_1 = require("../services/audit.service");
const index_1 = require("../config/index");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class ReceiptController {
    constructor() {
        this.getReceiptById = async (req, res) => {
            try {
                const { id } = req.params;
                const receipt = await prisma_1.prisma.receipt.findUnique({
                    where: { id },
                    include: {
                        payment: {
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
                            },
                        },
                    },
                });
                if (!receipt) {
                    return res.status(404).json({
                        success: false,
                        message: 'Receipt not found',
                    });
                }
                // Track download
                await prisma_1.prisma.receipt.update({
                    where: { id },
                    data: {
                        downloaded: true,
                        downloadedAt: new Date(),
                        downloadCount: { increment: 1 },
                    },
                });
                return res.status(200).json({
                    success: true,
                    data: receipt,
                });
            }
            catch (error) {
                console.error('Get receipt by ID error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.downloadReceipt = async (req, res) => {
            try {
                const { id } = req.params;
                const receipt = await prisma_1.prisma.receipt.findUnique({
                    where: { id },
                    include: {
                        payment: {
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
                            },
                        },
                    },
                });
                if (!receipt) {
                    res.status(404).json({
                        success: false,
                        message: 'Receipt not found',
                    });
                    return;
                }
                const filePath = path_1.default.join(index_1.config.receiptsPath, receipt.filePath);
                try {
                    await promises_1.default.access(filePath);
                }
                catch {
                    // Regenerate receipt if file doesn't exist
                    // First get the full payment with tenant data
                    const fullPayment = await prisma_1.prisma.payment.findUnique({
                        where: { id: receipt.paymentId },
                        include: {
                            tenant: true,
                        },
                    });
                    if (fullPayment) {
                        const receiptData = {
                            receiptNumber: fullPayment.receiptNumber || `MTA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${fullPayment.id.slice(-4).toUpperCase()}`,
                            tenantName: fullPayment.tenant.name,
                            apartment: fullPayment.tenant.apartment,
                            paymentType: fullPayment.type,
                            amount: fullPayment.amount,
                            month: fullPayment.month,
                            date: new Date(),
                            transactionCode: fullPayment.transactionCode || undefined,
                            caretakerName: fullPayment.caretakerName || undefined
                        };
                        await this.receiptService.generateReceipt(receiptData);
                    }
                }
                // Track download
                await prisma_1.prisma.receipt.update({
                    where: { id },
                    data: {
                        downloaded: true,
                        downloadedAt: new Date(),
                        downloadCount: { increment: 1 },
                    },
                });
                res.download(filePath, `receipt-${receipt.receiptNumber}.pdf`, (err) => {
                    if (err) {
                        console.error('Download error:', err);
                        if (!res.headersSent) {
                            res.status(500).json({
                                success: false,
                                message: 'Failed to download receipt',
                            });
                        }
                    }
                });
            }
            catch (error) {
                console.error('Download receipt error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Internal server error',
                    });
                }
            }
        };
        this.generateReceipt = async (req, res) => {
            try {
                if (!req.user || req.user.role !== 'ADMIN') {
                    return res.status(403).json({
                        success: false,
                        message: 'Admin access required',
                    });
                }
                const { paymentId } = req.params;
                const payment = await prisma_1.prisma.payment.findUnique({
                    where: { id: paymentId },
                    include: {
                        tenant: true,
                        receipts: true,
                    },
                });
                if (!payment) {
                    return res.status(404).json({
                        success: false,
                        message: 'Payment not found',
                    });
                }
                if (payment.status !== 'VERIFIED') {
                    return res.status(400).json({
                        success: false,
                        message: 'Only verified payments can have receipts',
                    });
                }
                // Check if receipt already exists
                if (payment.receipts.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Receipt already exists for this payment',
                    });
                }
                const receiptData = {
                    receiptNumber: payment.receipts?.[0]?.receiptNumber || `MTA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${payment.id.slice(-4).toUpperCase()}`,
                    tenantName: payment.tenant.name,
                    apartment: payment.tenant.apartment,
                    paymentType: payment.type,
                    amount: payment.amount,
                    month: payment.month,
                    date: new Date(),
                    transactionCode: payment.transactionCode || undefined,
                    caretakerName: payment.caretakerName || undefined
                };
                const receipt = await this.receiptService.generateReceipt(receiptData);
                if (typeof receipt === 'string') {
                    // receipt is file path
                    await this.auditLogService.log({
                        userId: req.user?.id,
                        userEmail: req.user?.email,
                        userRole: req.user?.role,
                        action: 'CREATE',
                        entity: 'RECEIPT',
                        entityId: receipt,
                        newData: {
                            receiptNumber: receiptData.receiptNumber
                        },
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent'),
                    });
                }
                else {
                    // receipt is file path string
                    await this.auditLogService.log({
                        userId: req.user?.id,
                        userEmail: req.user?.email,
                        userRole: req.user?.role,
                        action: 'CREATE',
                        entity: 'RECEIPT',
                        entityId: receipt,
                        newData: {
                            receiptNumber: receiptData.receiptNumber
                        },
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent'),
                    });
                }
                return res.status(201).json({
                    success: true,
                    message: 'Receipt generated successfully',
                    data: receipt,
                });
            }
            catch (error) {
                console.error('Generate receipt error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getTenantReceipts = async (req, res) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Not authenticated',
                    });
                }
                const { page = 1, limit = 20, startDate, endDate } = req.query;
                const skip = (Number(page) - 1) * Number(limit);
                const take = Number(limit);
                // Build where clause
                const where = {
                    payment: {
                        tenantId: req.user.id,
                    },
                };
                if (startDate || endDate) {
                    where.generatedAt = {};
                    if (startDate)
                        where.generatedAt.gte = new Date(startDate);
                    if (endDate)
                        where.generatedAt.lte = new Date(endDate);
                }
                const [receipts, total] = await Promise.all([
                    prisma_1.prisma.receipt.findMany({
                        where,
                        skip,
                        take,
                        orderBy: { generatedAt: 'desc' },
                        include: {
                            payment: {
                                select: {
                                    type: true,
                                    amount: true,
                                    month: true,
                                    method: true,
                                    createdAt: true,
                                },
                            },
                        },
                    }),
                    prisma_1.prisma.receipt.count({ where }),
                ]);
                return res.status(200).json({
                    success: true,
                    data: receipts,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                });
            }
            catch (error) {
                console.error('Get tenant receipts error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getAllReceipts = async (req, res) => {
            try {
                const { page = 1, limit = 20, startDate, endDate, tenantId, sortBy = 'generatedAt', sortOrder = 'desc', } = req.query;
                const skip = (Number(page) - 1) * Number(limit);
                const take = Number(limit);
                // Build where clause
                const where = {};
                if (startDate || endDate) {
                    where.generatedAt = {};
                    if (startDate)
                        where.generatedAt.gte = new Date(startDate);
                    if (endDate)
                        where.generatedAt.lte = new Date(endDate);
                }
                if (tenantId) {
                    where.payment = { tenantId: tenantId };
                }
                const [receipts, total] = await Promise.all([
                    prisma_1.prisma.receipt.findMany({
                        where,
                        skip,
                        take,
                        orderBy: {
                            [sortBy]: sortOrder,
                        },
                        include: {
                            payment: {
                                include: {
                                    tenant: {
                                        select: {
                                            id: true,
                                            name: true,
                                            apartment: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                    prisma_1.prisma.receipt.count({ where }),
                ]);
                res.status(200).json({
                    success: true,
                    data: receipts,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                });
            }
            catch (error) {
                console.error('Get all receipts error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.deleteReceipt = async (req, res) => {
            try {
                if (!req.user || req.user.role !== 'ADMIN') {
                    return res.status(403).json({
                        success: false,
                        message: 'Admin access required',
                    });
                }
                const { id } = req.params;
                const receipt = await prisma_1.prisma.receipt.findUnique({
                    where: { id },
                });
                if (!receipt) {
                    return res.status(404).json({
                        success: false,
                        message: 'Receipt not found',
                    });
                }
                // Delete file
                try {
                    const filePath = path_1.default.join(index_1.config.receiptsPath, receipt.filePath);
                    await promises_1.default.unlink(filePath);
                }
                catch (error) {
                    console.warn('Failed to delete receipt file:', error);
                }
                // Delete from database
                await prisma_1.prisma.receipt.delete({
                    where: { id },
                });
                // Log deletion
                await this.auditLogService.log({
                    userId: req.user.id,
                    userEmail: req.user.email,
                    userRole: req.user.role,
                    action: 'DELETE',
                    entity: 'RECEIPT',
                    entityId: receipt.id,
                    oldData: receipt,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                });
                return res.status(200).json({
                    success: true,
                    message: 'Receipt deleted successfully',
                });
            }
            catch (error) {
                console.error('Delete receipt error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.receiptService = new receipt_service_1.ReceiptService();
        this.auditLogService = new audit_service_1.AuditLogService();
    }
}
exports.ReceiptController = ReceiptController;
