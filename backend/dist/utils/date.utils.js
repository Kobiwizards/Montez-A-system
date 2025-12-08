"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
const date_fns_1 = require("date-fns");
class DateUtils {
    static formatDate(date, formatString = 'yyyy-MM-dd') {
        const d = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.format)(d, formatString);
    }
    static formatDateTime(date) {
        return this.formatDate(date, 'yyyy-MM-dd HH:mm:ss');
    }
    static getCurrentMonth() {
        return (0, date_fns_1.format)(new Date(), 'yyyy-MM');
    }
    static getPreviousMonth() {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return (0, date_fns_1.format)(date, 'yyyy-MM');
    }
    static getNextMonth() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return (0, date_fns_1.format)(date, 'yyyy-MM');
    }
    static getMonthName(monthString) {
        const [year, month] = monthString.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        return (0, date_fns_1.format)(date, 'MMMM yyyy');
    }
    static getMonthsBetween(startDate, endDate) {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        const months = [];
        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        while (current <= end) {
            months.push((0, date_fns_1.format)(current, 'yyyy-MM'));
            current.setMonth(current.getMonth() + 1);
        }
        return months;
    }
    static addDays(date, days) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.addDays)(d, days);
    }
    static addMonths(date, months) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.addMonths)(d, months);
    }
    static addYears(date, years) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.addYears)(d, years);
    }
    static getDaysBetween(startDate, endDate) {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        return (0, date_fns_1.differenceInDays)(end, start);
    }
    static getMonthsBetweenCount(startDate, endDate) {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        return (0, date_fns_1.differenceInMonths)(end, start);
    }
    static getYearsBetween(startDate, endDate) {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        return (0, date_fns_1.differenceInYears)(end, start);
    }
    static isDateInPast(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d < new Date();
    }
    static isDateInFuture(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d > new Date();
    }
    static isDateToday(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        return (d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear());
    }
    static getStartOfMonth(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    static getEndOfMonth(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
    static getStartOfDay(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    static getEndOfDay(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }
    static isValidDate(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d instanceof Date && !isNaN(d.getTime());
    }
    static parseDate(dateString) {
        // Try different date formats
        const formats = [
            'yyyy-MM-dd',
            'dd/MM/yyyy',
            'MM/dd/yyyy',
            'yyyy/MM/dd',
        ];
        for (const _ of formats) {
            try {
                return new Date(dateString);
            }
            catch {
                continue;
            }
        }
        throw new Error(`Invalid date format: ${dateString}`);
    }
    static getAgeInYears(birthDate) {
        const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    static getBusinessDaysBetween(startDate, endDate) {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        let businessDays = 0;
        const current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                businessDays++;
            }
            current.setDate(current.getDate() + 1);
        }
        return businessDays;
    }
    static formatRelativeTime(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diffInSeconds < 60) {
            return 'just now';
        }
        else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
        else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
        else {
            return this.formatDate(d, 'MMM d, yyyy');
        }
    }
    static getFiscalYear(date = new Date()) {
        // Assuming fiscal year starts in July (month 6)
        const month = date.getMonth();
        const year = date.getFullYear();
        return month >= 6 ? year + 1 : year;
    }
    static getQuarter(date = new Date()) {
        const month = date.getMonth();
        return Math.floor(month / 3) + 1;
    }
}
exports.DateUtils = DateUtils;
