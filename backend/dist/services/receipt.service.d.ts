import { Payment, User } from '@prisma/client';
export interface ReceiptData {
    receiptNumber: string;
    payment: Payment;
    tenant: User;
    generatedAt: Date;
}
export declare class ReceiptService {
    generateReceipt(payment: Payment & {
        tenant: User;
    }): Promise<{
        id: string;
        generatedAt: Date;
        tenantId: string;
        paymentId: string;
        receiptNumber: string;
        filePath: string;
        downloaded: boolean;
        downloadedAt: Date | null;
        downloadCount: number;
    }>;
    private getNextReceiptNumber;
    private generatePDF;
    private numberToWords;
    getReceipt(receiptId: string): Promise<{
        payment: {
            tenant: {
                id: string;
                email: string;
                phone: string;
                apartment: string;
                password: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
                unitType: import(".prisma/client").$Enums.UnitType;
                rentAmount: number;
                waterRate: number;
                balance: number;
                status: import(".prisma/client").$Enums.TenantStatus;
                moveInDate: Date;
                leaseEndDate: Date | null;
                emergencyContact: string | null;
                notes: string | null;
                idCopyUrl: string | null;
                contractUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            month: string;
            type: import(".prisma/client").$Enums.PaymentType;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            description: string | null;
            transactionCode: string | null;
            caretakerName: string | null;
            adminNotes: string | null;
            tenantId: string;
            currency: string;
            screenshotUrls: string[];
            verifiedAt: Date | null;
            verifiedBy: string | null;
        };
    } & {
        id: string;
        generatedAt: Date;
        tenantId: string;
        paymentId: string;
        receiptNumber: string;
        filePath: string;
        downloaded: boolean;
        downloadedAt: Date | null;
        downloadCount: number;
    }>;
    downloadReceipt(receiptId: string): Promise<{
        filePath: string;
        receiptNumber: string;
        fileName: string;
    }>;
    getReceiptsByTenant(tenantId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        receipts: ({
            payment: {
                createdAt: Date;
                month: string;
                type: import(".prisma/client").$Enums.PaymentType;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
            };
        } & {
            id: string;
            generatedAt: Date;
            tenantId: string;
            paymentId: string;
            receiptNumber: string;
            filePath: string;
            downloaded: boolean;
            downloadedAt: Date | null;
            downloadCount: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    generateBulkReceipts(paymentIds: string[]): Promise<{
        successful: string[];
        failed: Array<{
            id: string;
            error: string;
        }>;
    }>;
    deleteReceipt(receiptId: string): Promise<{
        id: string;
        generatedAt: Date;
        tenantId: string;
        paymentId: string;
        receiptNumber: string;
        filePath: string;
        downloaded: boolean;
        downloadedAt: Date | null;
        downloadCount: number;
    }>;
}
//# sourceMappingURL=receipt.service.d.ts.map