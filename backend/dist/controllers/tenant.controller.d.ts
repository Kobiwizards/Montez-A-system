import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class TenantController {
    private auditLogService;
    private emailService;
    constructor();
    getAllTenants: (req: Request, res: Response) => Promise<void>;
    getTenantById: (req: Request, res: Response) => Promise<Response>;
    createTenant: (req: Request, res: Response) => Promise<Response>;
    updateTenant: (req: Request, res: Response) => Promise<Response>;
    deleteTenant: (req: Request, res: Response) => Promise<Response>;
    getTenantDashboard: (req: AuthRequest, res: Response) => Promise<Response>;
    updateTenantBalance: (req: Request, res: Response) => Promise<Response>;
}
//# sourceMappingURL=tenant.controller.d.ts.map