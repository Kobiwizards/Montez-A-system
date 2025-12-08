export declare class AnalyticsService {
    generateDailySnapshot(): Promise<void>;
    sendPaymentReminders(): Promise<void>;
    generateFinancialReport(_options: any): Promise<any>;
    generateOccupancyReport(): Promise<any>;
    generateTenantReport(): Promise<any>;
    generateWaterConsumptionReport(_options: any): Promise<any>;
    convertToCSV(_data: any): string;
    generatePDFReport(_data: any, _type: string): Promise<Buffer>;
}
//# sourceMappingURL=analytics.service.d.ts.map