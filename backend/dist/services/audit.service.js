"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const prisma_1 = require("../lib/prisma");
class AuditLogService {
    async log(data) {
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    userEmail: data.userEmail,
                    userRole: data.userRole,
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    oldData: data.oldData ? JSON.parse(JSON.stringify(data.oldData)) : undefined,
                    newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : undefined,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    createdAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error for audit log failures to avoid breaking main operations
        }
    }
    async getLogs(filters = {}) {
        const { userId, action, entity, startDate, endDate, page = 1, limit = 50, } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (userId)
            where.userId = userId;
        if (action)
            where.action = action;
        if (entity)
            where.entity = entity;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        // Get logs with user info using a separate query
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.auditLog.count({ where }),
        ]);
        // Get user info for logs that have userId
        const logsWithUsers = await Promise.all(logs.map(async (log) => {
            let user = null; // FIX: Changed from 'let user: null = null'
            if (log.userId) {
                user = await prisma_1.prisma.user.findUnique({
                    where: { id: log.userId },
                    select: {
                        name: true,
                        email: true,
                        role: true,
                    },
                });
            }
            return {
                ...log,
                user,
            };
        }));
        return {
            logs: logsWithUsers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getEntityHistory(entity, entityId) {
        const logs = await prisma_1.prisma.auditLog.findMany({
            where: {
                entity,
                entityId,
            },
            orderBy: { createdAt: 'desc' },
        });
        // Get user info for logs
        const logsWithUsers = await Promise.all(logs.map(async (log) => {
            let user = null; // FIX: Changed type
            if (log.userId) {
                user = await prisma_1.prisma.user.findUnique({
                    where: { id: log.userId },
                    select: {
                        name: true,
                        email: true,
                        role: true,
                    },
                });
            }
            return {
                id: log.id,
                action: log.action,
                user,
                timestamp: log.createdAt,
                changes: this.extractChanges(log.oldData, log.newData),
                ipAddress: log.ipAddress,
            };
        }));
        return logsWithUsers;
    }
    extractChanges(oldData, newData) {
        if (!oldData && !newData)
            return [];
        const changes = [];
        const allKeys = new Set([
            ...Object.keys(oldData || {}),
            ...Object.keys(newData || {}),
        ]);
        for (const key of allKeys) {
            const oldValue = oldData?.[key];
            const newValue = newData?.[key];
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({
                    field: key,
                    oldValue,
                    newValue,
                });
            }
        }
        return changes;
    }
    async exportLogs(format = 'json', filters = {}) {
        const { logs } = await this.getLogs({ ...filters, limit: 1000 });
        if (format === 'csv') {
            return this.convertLogsToCSV(logs);
        }
        return logs;
    }
    convertLogsToCSV(logs) {
        const headers = [
            'Timestamp',
            'Action',
            'Entity',
            'Entity ID',
            'User',
            'User Role',
            'IP Address',
            'Changes',
        ];
        const rows = logs.map(log => [
            log.createdAt.toISOString(),
            log.action,
            log.entity,
            log.entityId || '',
            log.user?.name || log.userEmail || 'System',
            log.userRole || log.user?.role || '',
            log.ipAddress || '',
            this.formatChangesForCSV(log.oldData, log.newData),
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');
        return csvContent;
    }
    formatChangesForCSV(oldData, newData) {
        const changes = this.extractChanges(oldData, newData);
        return changes
            .map(change => `${change.field}: ${change.oldValue} → ${change.newValue}`)
            .join('; ');
    }
    async cleanupOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await prisma_1.prisma.auditLog.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });
        console.log(`Cleaned up ${result.count} old audit logs`);
        return result.count;
    }
}
exports.AuditLogService = AuditLogService;
