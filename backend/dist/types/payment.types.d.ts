export interface Payment {
    id: string;
    tenantId: string;
    type: 'RENT' | 'WATER' | 'MAINTENANCE' | 'OTHER';
    method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';
    amount: number;
    currency: string;
    month: string;
    year: number;
    description?: string;
    transactionCode?: string;
    caretakerName?: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELLED';
    screenshotUrls: string[];
    verifiedAt?: Date;
    verifiedBy?: string;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreatePaymentRequest {
    type: 'RENT' | 'WATER' | 'MAINTENANCE' | 'OTHER';
    method: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CHECK';
    amount: number;
    month: string;
    description?: string;
    transactionCode?: string;
    caretakerName?: string;
}
export interface VerifyPaymentRequest {
    status: 'VERIFIED' | 'REJECTED';
    adminNotes?: string;
}
export interface PaymentStatistics {
    totalPayments: number;
    totalAmount: number;
    verifiedPayments: number;
    pendingPayments: number;
    rejectedPayments: number;
    verificationRate: number;
    byType: {
        RENT: number;
        WATER: number;
        MAINTENANCE: number;
        OTHER: number;
    };
    byMethod: {
        MPESA: number;
        CASH: number;
        BANK_TRANSFER: number;
        CHECK: number;
    };
    averageVerificationTime: number;
    startDate: Date;
    endDate: Date;
}
export interface PaymentProjection {
    month: string;
    projectedRent: number;
    projectedWater: number;
    totalProjected: number;
    expectedTenants: number;
}
//# sourceMappingURL=payment.types.d.ts.map