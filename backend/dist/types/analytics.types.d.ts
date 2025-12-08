export interface AnalyticsSnapshot {
    id: string;
    date: Date;
    totalRentDue: number;
    totalRentPaid: number;
    totalWaterDue: number;
    totalWaterPaid: number;
    totalOtherDue: number;
    totalOtherPaid: number;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    maintenanceUnits: number;
    occupancyRate: number;
    vacancyRate: number;
    pendingPayments: number;
    verifiedPayments: number;
    rejectedPayments: number;
    currentTenants: number;
    overdueTenants: number;
    delinquentTenants: number;
    createdAt: Date;
}
export interface FinancialReport {
    period: string;
    revenue: {
        rent: number;
        water: number;
        other: number;
        total: number;
    };
    expenses: {
        maintenance: number;
        utilities: number;
        staff: number;
        other: number;
        total: number;
    };
    profit: number;
    collectionRate: number;
    outstandingAmount: number;
    monthlyTrends: Array<{
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
        occupancyRate: number;
    }>;
}
export interface OccupancyReport {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    maintenanceUnits: number;
    occupancyRate: number;
    vacancyRate: number;
    floorBreakdown: Array<{
        floor: number;
        total: number;
        occupied: number;
        occupancyRate: number;
    }>;
    unitTypeBreakdown: Array<{
        type: string;
        total: number;
        occupied: number;
        occupancyRate: number;
    }>;
}
//# sourceMappingURL=analytics.types.d.ts.map