"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const client_1 = require("@prisma/client");
const http_1 = require("http");
const websocket_1 = require("./websocket");
const analytics_service_1 = require("./services/analytics.service");
const prisma = new client_1.PrismaClient();
const analyticsService = new analytics_service_1.AnalyticsService();
const PORT = config_1.config.port || 3001;
async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        const app = (0, app_1.createApp)();
        const server = (0, http_1.createServer)(app);
        // Setup WebSocket for real-time updates
        (0, websocket_1.setupWebSocket)(server);
        server.listen(PORT, () => {
            console.log(`��� Server running on port ${PORT}`);
            console.log(`��� API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`��� Environment: ${config_1.config.nodeEnv}`);
            console.log(`��� CORS Origin: ${config_1.config.corsOrigin}`);
        });
        // Setup automated tasks
        setupAutomatedTasks();
        // Graceful shutdown
        const gracefulShutdown = async () => {
            console.log('��� Received shutdown signal');
            server.close(async () => {
                console.log('��� HTTP server closed');
                await prisma.$disconnect();
                console.log('��� Database connection closed');
                process.exit(0);
            });
            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⏰ Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
function setupAutomatedTasks() {
    console.log('��� Setting up automated tasks...');
    // Daily analytics snapshot at 1 AM
    const scheduleAnalyticsSnapshot = () => {
        const now = new Date();
        const target = new Date(now);
        target.setHours(1, 0, 0, 0);
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }
        const delay = target.getTime() - now.getTime();
        setTimeout(async () => {
            try {
                await analyticsService.generateDailySnapshot();
                console.log('��� Daily analytics snapshot generated');
            }
            catch (error) {
                console.error('❌ Failed to generate analytics snapshot:', error);
            }
            // Schedule next day
            scheduleAnalyticsSnapshot();
        }, delay);
    };
    // Send payment reminders on 25th of each month at 9 AM
    const schedulePaymentReminders = () => {
        const now = new Date();
        const target = new Date(now);
        if (now.getDate() >= 25) {
            target.setMonth(target.getMonth() + 1);
        }
        target.setDate(25);
        target.setHours(9, 0, 0, 0);
        const delay = target.getTime() - now.getTime();
        setTimeout(async () => {
            try {
                await analyticsService.sendPaymentReminders();
                console.log('��� Payment reminders sent');
            }
            catch (error) {
                console.error('❌ Failed to send payment reminders:', error);
            }
            // Schedule next month
            schedulePaymentReminders();
        }, delay);
    };
    scheduleAnalyticsSnapshot();
    schedulePaymentReminders();
}
startServer();
//# sourceMappingURL=server.js.map