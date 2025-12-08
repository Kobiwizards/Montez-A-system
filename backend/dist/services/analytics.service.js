"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
class AnalyticsService {
    async generateDailySnapshot() {
        // Implement if needed
        return Promise.resolve();
    }
    async sendPaymentReminders() {
        // Implement if needed
        return Promise.resolve();
    }
    // Add dummy methods to satisfy TypeScript
    generateFinancialReport(_options) {
        return Promise.resolve({});
    }
    generateOccupancyReport() {
        return Promise.resolve({});
    }
    generateTenantReport() {
        return Promise.resolve({});
    }
    generateWaterConsumptionReport(_options) {
        return Promise.resolve({});
    }
    convertToCSV(_data) {
        return '';
    }
    generatePDFReport(_data, _type) {
        return Promise.resolve(Buffer.from(''));
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map