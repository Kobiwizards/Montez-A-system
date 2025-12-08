import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class PaymentController {
    private auditLogService;
    private receiptService;
    private emailService;
    private fileService;
    constructor();
    getAllPayments: (req: Request, res: Response) => Promise<void>;
    getPaymentById: (req: Request, res: Response) => Promise<Response>;
    createPayment: (req: AuthRequest, res: Response) => Promise<Response>;
    verifyPayment: (req: AuthRequest, res: Response) => Promise<Response>;
    getPendingPayments: (req: Request, res: Response) => Promise<void>;
    getTenantPayments: (req: AuthRequest, res: Response) => Promise<Response>;
    deletePayment: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=payment.controller.d.ts.map