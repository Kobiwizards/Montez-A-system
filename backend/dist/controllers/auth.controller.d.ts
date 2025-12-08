import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class AuthController {
    private auditLogService;
    constructor();
    login: (req: Request, res: Response) => Promise<Response>;
    register: (req: Request, res: Response) => Promise<Response>;
    getProfile: (req: AuthRequest, res: Response) => Promise<Response>;
    updateProfile: (req: AuthRequest, res: Response) => Promise<Response>;
    changePassword: (req: AuthRequest, res: Response) => Promise<Response>;
    logout: (req: AuthRequest, res: Response) => Promise<Response>;
}
//# sourceMappingURL=auth.controller.d.ts.map