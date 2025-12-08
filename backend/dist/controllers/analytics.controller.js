"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const prisma_1 = require("../lib/prisma");
const analytics_service_1 = require("../services/analytics.service");
const date_fns_1 = require("date-fns");
class AnalyticsController {
    constructor() {
        this.getDashboardMetrics = async (_, res) => {
            try {
                const currentDate = new Date();
                const totalUnits = 26;
                // Get occupancy metrics
                const tenants = await prisma_1.prisma.user.findMany({
                    where: {
                        role: 'TENANT',
                        status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] },
                    },
                });
                const occupiedUnits = tenants.length;
                const vacantUnits = totalUnits - occupiedUnits;
                const occupancyRate = (occupiedUnits / totalUnits) * 100;
                // Get financial metrics for current month
                const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
                const [payments, waterReadings] = await Promise.all([
                    prisma_1.prisma.payment.findMany({
                        where: {
                            month: currentMonth,
                            status: 'VERIFIED',
                        },
                    }),
                    prisma_1.prisma.waterReading.findMany({
                        where: {
                            month: currentMonth,
                            paid: true,
                        },
                    }),
                ]);
                const totalRentPaid = payments
                    .filter(p => p.type === 'RENT')
                    .reduce((sum, p) => sum + p.amount, 0);
                const totalWaterPaid = waterReadings.reduce((sum, r) => sum + r.amount, 0);
                const totalOtherPaid = payments
                    .filter(p => p.type === 'OTHER' || p.type === 'MAINTENANCE')
                    .reduce((sum, p) => sum + p.amount, 0);
                const totalCollected = totalRentPaid + totalWaterPaid + totalOtherPaid;
                // Get expected amounts
                const totalExpectedRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0);
                const totalExpectedWater = waterReadings.reduce((sum, r) => sum + r.amount, 0);
                const collectionRate = totalExpectedRent > 0
                    ? (totalRentPaid / totalExpectedRent) * 100
                    : 0;
                // Get pending payments
                const pendingPayments = await prisma_1.prisma.payment.count({
                    where: { status: 'PENDING' },
                });
                // Get tenant status counts
                const currentTenants = tenants.filter(t => t.status === 'CURRENT').length;
                const overdueTenants = tenants.filter(t => t.status === 'OVERDUE').length;
                const delinquentTenants = tenants.filter(t => t.status === 'DELINQUENT').length;
                // Get maintenance requests
                const activeMaintenanceRequests = await prisma_1.prisma.maintenanceRequest.count({
                    where: {
                        status: { in: ['PENDING', 'IN_PROGRESS'] },
                    },
                });
                // Get recent payments
                const recentPayments = await prisma_1.prisma.payment.findMany({
                    where: {
                        createdAt: {
                            gte: (0, date_fns_1.subMonths)(currentDate, 1),
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        tenant: {
                            select: {
                                name: true,
                                apartment: true,
                            },
                        },
                    },
                });
                // Get monthly trends (last 6 months)
                const months = Array.from({ length: 6 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    return date.toISOString().slice(0, 7);
                }).reverse();
                const monthlyData = await Promise.all(months.map(async (month) => {
                    const [monthPayments, monthWater] = await Promise.all([
                        prisma_1.prisma.payment.findMany({
                            where: {
                                month,
                                status: 'VERIFIED',
                                type: 'RENT',
                            },
                        }),
                        prisma_1.prisma.waterReading.findMany({
                            where: {
                                month,
                                paid: true,
                            },
                        }),
                    ]);
                    const rentCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
                    const waterCollected = monthWater.reduce((sum, r) => sum + r.amount, 0);
                    // Get occupancy for this month
                    const monthTenants = await prisma_1.prisma.user.findMany({
                        where: {
                            role: 'TENANT',
                            OR: [
                                { moveInDate: { lte: (0, date_fns_1.endOfMonth)(new Date(`${month}-01`)) } },
                            ],
                            AND: [
                                {
                                    OR: [
                                        { leaseEndDate: { gte: (0, date_fns_1.startOfMonth)(new Date(`${month}-01`)) } },
                                        { leaseEndDate: null },
                                    ],
                                },
                                { status: { in: ['CURRENT', 'OVERDUE', 'DELINQUENT'] } },
                            ],
                        },
                    });
                    const monthOccupancyRate = (monthTenants.length / totalUnits) * 100;
                    return {
                        month,
                        rentCollected,
                        waterCollected,
                        totalCollected: rentCollected + waterCollected,
                        occupancyRate: monthOccupancyRate,
                        tenantCount: monthTenants.length,
                    };
                }));
                const dashboardData = {
                    occupancy: {
                        totalUnits,
                        occupiedUnits,
                        vacantUnits,
                        occupancyRate,
                    },
                    financial: {
                        currentMonth: {
                            rentCollected: totalRentPaid,
                            waterCollected: totalWaterPaid,
                            otherCollected: totalOtherPaid,
                            totalCollected,
                            expectedRent: totalExpectedRent,
                            expectedWater: totalExpectedWater,
                            collectionRate,
                        },
                        monthlyTrends: monthlyData,
                    },
                    payments: {
                        pending: pendingPayments,
                        recent: recentPayments,
                    },
                    tenants: {
                        total: tenants.length,
                        current: currentTenants,
                        overdue: overdueTenants,
                        delinquent: delinquentTenants,
                    },
                    maintenance: {
                        active: activeMaintenanceRequests,
                    },
                    overview: {
                        totalOutstanding: tenants.reduce((sum, t) => sum + t.balance, 0),
                        averageRent: tenants.length > 0
                            ? tenants.reduce((sum, t) => sum + t.rentAmount, 0) / tenants.length
                            : 0,
                        averageWaterConsumption: waterReadings.length > 0
                            ? waterReadings.reduce((sum, r) => sum + r.units, 0) / waterReadings.length
                            : 0,
                    },
                };
                res.status(200).json({
                    success: true,
                    data: dashboardData,
                });
            }
            catch (error) {
                console.error('Get dashboard metrics error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getFinancialReport = async (req, res) => {
            try {
                const { startDate, endDate, period = 'month' } = req.query;
                const report = await this.analyticsService.generateFinancialReport({
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    period: period,
                });
                res.status(200).json({
                    success: true,
                    data: report,
                });
            }
            catch (error) {
                console.error('Get financial report error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getOccupancyReport = async (_, res) => {
            try {
                const report = await this.analyticsService.generateOccupancyReport();
                res.status(200).json({
                    success: true,
                    data: report,
                });
            }
            catch (error) {
                console.error('Get occupancy report error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getTenantReport = async (_, res) => {
            try {
                const report = await this.analyticsService.generateTenantReport();
                res.status(200).json({
                    success: true,
                    data: report,
                });
            }
            catch (error) {
                console.error('Get tenant report error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getWaterConsumptionReport = async (req, res) => {
            try {
                const { startDate, endDate } = req.query;
                const report = await this.analyticsService.generateWaterConsumptionReport({
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                });
                res.status(200).json({
                    success: true,
                    data: report,
                });
            }
            catch (error) {
                console.error('Get water consumption report error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.exportReport = async (req, res) => {
            try {
                const { type: returnType, format = 'json', ...params } = req.query;
                let report;
                switch (returnType) {
                    case 'financial':
                        report = await this.analyticsService.generateFinancialReport(params);
                        break;
                    case 'occupancy':
                        report = await this.analyticsService.generateOccupancyReport();
                        break;
                    case 'tenant':
                        report = await this.analyticsService.generateTenantReport();
                        break;
                    case 'water':
                        report = await this.analyticsService.generateWaterConsumptionReport(params);
                        break;
                    default:
                        res.status(400).json({
                            success: false,
                            message: 'Invalid report type',
                        });
                        return;
                }
                if (format === 'csv') {
                    const csv = this.analyticsService.convertToCSV(report);
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', `attachment; filename=${returnType}-report-${Date.now()}.csv`);
                    res.send(csv);
                    return;
                }
                if (format === 'pdf') {
                    const pdfBuffer = await this.analyticsService.generatePDFReport(report, returnType);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename=${returnType}-report-${Date.now()}.pdf`);
                    res.send(pdfBuffer);
                    return;
                }
                // Default to JSON
                res.status(200).json({
                    success: true,
                    data: report,
                });
            }
            catch (error) {
                console.error('Export report error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.analyticsService = new analytics_service_1.AnalyticsService();
    }
}
exports.AnalyticsController = AnalyticsController;
