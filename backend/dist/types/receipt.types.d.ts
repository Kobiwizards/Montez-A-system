export interface Receipt {
    id: string;
    paymentId: string;
    tenantId: string;
    receiptNumber: string;
    filePath: string;
    generatedAt: Date;
    downloaded: boolean;
    downloadedAt?: Date;
    downloadCount: number;
}
export interface ReceiptWithRelations extends Receipt {
    payment?: {
        id: string;
        type: string;
        amount: number;
        month: string;
        method: string;
        createdAt: Date;
    };
    tenant?: {
        id: string;
        name: string;
        email: string;
        apartment: string;
    };
}
//# sourceMappingURL=receipt.types.d.ts.map