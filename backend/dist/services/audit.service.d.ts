export interface AuditLogData {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogService {
    log(data: AuditLogData): Promise<void>;
    getLogs(filters?: {
        userId?: string;
        action?: string;
        entity?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: {
            user: {
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
            id: string;
            createdAt: Date;
            userId: string | null;
            userEmail: string | null;
            userRole: string | null;
            action: string;
            entity: string;
            entityId: string | null;
            oldData: import("@prisma/client/runtime/library").JsonValue | null;
            newData: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getEntityHistory(entity: string, entityId: string): Promise<{
        id: string;
        action: string;
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        timestamp: Date;
        changes: {
            field: string;
            oldValue: any;
            newValue: any;
        }[];
        ipAddress: string | null;
    }[]>;
    private extractChanges;
    exportLogs(format?: 'json' | 'csv', filters?: any): Promise<string | {
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        id: string;
        createdAt: Date;
        userId: string | null;
        userEmail: string | null;
        userRole: string | null;
        action: string;
        entity: string;
        entityId: string | null;
        oldData: import("@prisma/client/runtime/library").JsonValue | null;
        newData: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    private convertLogsToCSV;
    private formatChangesForCSV;
    cleanupOldLogs(daysToKeep?: number): Promise<number>;
}
//# sourceMappingURL=audit.service.d.ts.map