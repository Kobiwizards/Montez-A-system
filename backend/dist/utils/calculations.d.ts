export declare const MONTEZ_A_UNITS = 26;
export declare const FLOORS = 6;
export declare const UNITS_PER_FLOOR = 4;
export interface ApartmentInfo {
    number: string;
    floor: number;
    type: 'ONE_BEDROOM' | 'TWO_BEDROOM';
    rent: number;
}
export declare const MONTEZ_A_APARTMENTS: ApartmentInfo[];
export declare function calculateWaterBill(units: number): number;
export declare function calculateOccupancyRate(occupiedUnits: number): number;
export declare function calculateMonthlyRentProjection(): number;
export declare function calculateLateFee(amount: number, daysLate: number): number;
export declare function calculateProratedRent(dailyRate: number, daysOccupied: number): number;
export declare function calculateTotalRevenue(rentPayments: number, waterPayments: number, otherPayments?: number): number;
export declare function calculateCollectionRate(amountCollected: number, amountDue: number): number;
export declare function calculateAverageTenancyDuration(moveInDates: Date[]): number;
export declare function calculateWaterConsumptionTrend(readings: {
    month: string;
    units: number;
}[]): {
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    percentageChange: number;
};
export declare function generateFinancialProjection(currentRevenue: number, growthRate: number, months: number): number[];
export declare function calculateBreakEvenPoint(fixedCosts: number, variableCostPerUnit: number, pricePerUnit: number): number;
export declare function calculateNetOperatingIncome(grossIncome: number, operatingExpenses: number, vacancyRate: number): number;
export declare function calculateCashOnCashReturn(annualCashFlow: number, totalInvestment: number): number;
export declare function formatCurrency(amount: number): string;
export declare function formatPercentage(value: number): string;
export declare function getFloorOccupancy(tenants: {
    apartment: string;
}[]): Map<number, number>;
export declare function getUnitTypeOccupancy(tenants: {
    apartment: string;
}[]): {
    ONE_BEDROOM: number;
    TWO_BEDROOM: number;
};
//# sourceMappingURL=calculations.d.ts.map