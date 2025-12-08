import { Request, Response } from 'express';
export declare class AnalyticsController {
    private analyticsService;
    constructor();
    getDashboardMetrics: (_: Request, res: Response) => Promise<void>;
    getFinancialReport: (req: Request, res: Response) => Promise<void>;
    getOccupancyReport: (_: Request, res: Response) => Promise<void>;
    getTenantReport: (_: Request, res: Response) => Promise<void>;
    getWaterConsumptionReport: (req: Request, res: Response) => Promise<void>;
    exportReport: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map