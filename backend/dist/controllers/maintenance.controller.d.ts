import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class MaintenanceController {
    private auditLogService;
    private emailService;
    private fileService;
    constructor();
    createRequest: (req: AuthRequest, res: Response) => Promise<Response>;
    getAllRequests: (req: Request, res: Response) => Promise<void>;
    getRequestById: (req: AuthRequest, res: Response) => Promise<Response>;
    updateRequestStatus: (req: AuthRequest, res: Response) => Promise<Response>;
    updateRequest: (req: AuthRequest, res: Response) => Promise<Response>;
    deleteRequest: (req: AuthRequest, res: Response) => Promise<Response>;
    getTenantRequests: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=maintenance.controller.d.ts.map