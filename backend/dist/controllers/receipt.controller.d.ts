import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ReceiptController {
    private receiptService;
    private auditLogService;
    constructor();
    getReceiptById: (req: Request, res: Response) => Promise<Response>;
    downloadReceipt: (req: Request, res: Response) => Promise<void>;
    generateReceipt: (req: AuthRequest, res: Response) => Promise<Response>;
    getTenantReceipts: (req: AuthRequest, res: Response) => Promise<Response>;
    getAllReceipts: (req: Request, res: Response) => Promise<void>;
    deleteReceipt: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=receipt.controller.d.ts.map