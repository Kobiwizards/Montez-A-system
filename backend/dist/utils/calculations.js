"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONTEZ_A_APARTMENTS = exports.UNITS_PER_FLOOR = exports.FLOORS = exports.MONTEZ_A_UNITS = void 0;
exports.calculateWaterBill = calculateWaterBill;
exports.calculateOccupancyRate = calculateOccupancyRate;
exports.calculateMonthlyRentProjection = calculateMonthlyRentProjection;
exports.calculateLateFee = calculateLateFee;
exports.calculateProratedRent = calculateProratedRent;
exports.calculateTotalRevenue = calculateTotalRevenue;
exports.calculateCollectionRate = calculateCollectionRate;
exports.calculateAverageTenancyDuration = calculateAverageTenancyDuration;
exports.calculateWaterConsumptionTrend = calculateWaterConsumptionTrend;
exports.generateFinancialProjection = generateFinancialProjection;
exports.calculateBreakEvenPoint = calculateBreakEvenPoint;
exports.calculateNetOperatingIncome = calculateNetOperatingIncome;
exports.calculateCashOnCashReturn = calculateCashOnCashReturn;
exports.formatCurrency = formatCurrency;
exports.formatPercentage = formatPercentage;
exports.getFloorOccupancy = getFloorOccupancy;
exports.getUnitTypeOccupancy = getUnitTypeOccupancy;
const index_1 = require("../config/index");
// Montez A specific calculations
exports.MONTEZ_A_UNITS = 26;
exports.FLOORS = 6;
exports.UNITS_PER_FLOOR = 4; // Except rooftop which has 2
exports.MONTEZ_A_APARTMENTS = [
    // Floor 1
    { number: '1A1', floor: 1, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '1A2', floor: 1, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '1B1', floor: 1, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    { number: '1B2', floor: 1, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    // Floor 2
    { number: '2A1', floor: 2, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '2A2', floor: 2, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '2B1', floor: 2, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    { number: '2B2', floor: 2, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    // Floor 3
    { number: '3A1', floor: 3, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '3A2', floor: 3, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '3B1', floor: 3, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    { number: '3B2', floor: 3, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    // Floor 4
    { number: '4A1', floor: 4, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '4A2', floor: 4, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '4B1', floor: 4, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    { number: '4B2', floor: 4, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    // Floor 5
    { number: '5A1', floor: 5, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '5A2', floor: 5, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '5B1', floor: 5, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    { number: '5B2', floor: 5, type: 'ONE_BEDROOM', rent: index_1.config.oneBedroomRent },
    // Rooftop (Floor 6)
    { number: '6A1', floor: 6, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
    { number: '6A2', floor: 6, type: 'TWO_BEDROOM', rent: index_1.config.twoBedroomRent },
];
// Financial calculations
function calculateWaterBill(units) {
    return units * index_1.config.waterRatePerUnit;
}
function calculateOccupancyRate(occupiedUnits) {
    return (occupiedUnits / exports.MONTEZ_A_UNITS) * 100;
}
function calculateMonthlyRentProjection() {
    return exports.MONTEZ_A_APARTMENTS.reduce((total, apt) => total + apt.rent, 0);
}
function calculateLateFee(amount, daysLate) {
    const dailyRate = 0.005; // 0.5% per day
    const maxFee = amount * 0.2; // Max 20%
    const calculatedFee = amount * dailyRate * daysLate;
    return Math.min(calculatedFee, maxFee);
}
function calculateProratedRent(dailyRate, daysOccupied) {
    return dailyRate * daysOccupied;
}
function calculateTotalRevenue(rentPayments, waterPayments, otherPayments = 0) {
    return rentPayments + waterPayments + otherPayments;
}
function calculateCollectionRate(amountCollected, amountDue) {
    if (amountDue === 0)
        return 100;
    return (amountCollected / amountDue) * 100;
}
function calculateAverageTenancyDuration(moveInDates) {
    if (moveInDates.length === 0)
        return 0;
    const now = new Date();
    const totalMonths = moveInDates.reduce((sum, date) => {
        const moveIn = new Date(date);
        const months = (now.getFullYear() - moveIn.getFullYear()) * 12 +
            (now.getMonth() - moveIn.getMonth());
        return sum + Math.max(0, months);
    }, 0);
    return totalMonths / moveInDates.length;
}
function calculateWaterConsumptionTrend(readings) {
    if (readings.length < 2) {
        return { trend: 'STABLE', percentageChange: 0 };
    }
    const sortedReadings = [...readings].sort((a, b) => a.month.localeCompare(b.month));
    const first = sortedReadings[0];
    const last = sortedReadings[sortedReadings.length - 1];
    const percentageChange = ((last.units - first.units) / first.units) * 100;
    if (percentageChange > 10)
        return { trend: 'INCREASING', percentageChange };
    if (percentageChange < -10)
        return { trend: 'DECREASING', percentageChange };
    return { trend: 'STABLE', percentageChange };
}
function generateFinancialProjection(currentRevenue, growthRate, months) {
    const projections = [];
    let revenue = currentRevenue;
    for (let i = 0; i < months; i++) {
        revenue *= (1 + growthRate);
        projections.push(revenue);
    }
    return projections;
}
function calculateBreakEvenPoint(fixedCosts, variableCostPerUnit, pricePerUnit) {
    if (pricePerUnit <= variableCostPerUnit) {
        throw new Error('Price must be greater than variable cost per unit');
    }
    return fixedCosts / (pricePerUnit - variableCostPerUnit);
}
function calculateNetOperatingIncome(grossIncome, operatingExpenses, vacancyRate) {
    const effectiveGrossIncome = grossIncome * (1 - vacancyRate / 100);
    return effectiveGrossIncome - operatingExpenses;
}
function calculateCashOnCashReturn(annualCashFlow, totalInvestment) {
    return (annualCashFlow / totalInvestment) * 100;
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}
function getFloorOccupancy(tenants) {
    const floorOccupancy = new Map();
    // Initialize all floors
    for (let floor = 1; floor <= exports.FLOORS; floor++) {
        floorOccupancy.set(floor, 0);
    }
    // Count tenants per floor
    tenants.forEach(tenant => {
        const apartment = exports.MONTEZ_A_APARTMENTS.find(a => a.number === tenant.apartment);
        if (apartment) {
            floorOccupancy.set(apartment.floor, (floorOccupancy.get(apartment.floor) || 0) + 1);
        }
    });
    return floorOccupancy;
}
function getUnitTypeOccupancy(tenants) {
    const occupancy = {
        ONE_BEDROOM: 0,
        TWO_BEDROOM: 0,
    };
    tenants.forEach(tenant => {
        const apartment = exports.MONTEZ_A_APARTMENTS.find(a => a.number === tenant.apartment);
        if (apartment) {
            occupancy[apartment.type]++;
        }
    });
    return occupancy;
}
