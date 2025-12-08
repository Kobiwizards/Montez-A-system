import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class WaterController {
    private auditLogService;
    constructor();
    getAllReadings: (req: Request, res: Response) => Promise<void>;
    getReadingById: (req: Request, res: Response) => Promise<Response>;
    createReading: (req: AuthRequest, res: Response) => Promise<Response>;
    updateReading: (req: AuthRequest, res: Response) => Promise<Response>;
    deleteReading: (req: AuthRequest, res: Response) => Promise<Response>;
    getTenantReadings: (req: AuthRequest, res: Response) => Promise<Response>;
    calculateWaterBill: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=water.controller.d.ts.map