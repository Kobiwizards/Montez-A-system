import { User, Payment, Receipt } from '@prisma/client';
export declare class EmailService {
    private transporter;
    constructor();
    private sendEmail;
    sendWelcomeEmail(tenant: User, tempPassword: string): Promise<void>;
    sendPaymentNotification(payment: Payment, tenant: User): Promise<void>;
    sendPaymentStatusNotification(tenant: User, payment: Payment): Promise<void>;
    sendReceiptEmail(tenant: User, receipt: Receipt): Promise<void>;
    sendPaymentReminder(tenant: User, month: string): Promise<void>;
    sendBalanceNotification(tenant: User, newBalance: number): Promise<void>;
    sendMaintenanceUpdate(tenant: User, request: any, updateType: 'created' | 'updated' | 'resolved'): Promise<void>;
    sendSystemNotification(to: string, subject: string, message: string): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map