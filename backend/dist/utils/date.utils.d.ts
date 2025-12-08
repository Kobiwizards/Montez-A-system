export declare class DateUtils {
    static formatDate(date: Date | string, formatString?: string): string;
    static formatDateTime(date: Date | string): string;
    static getCurrentMonth(): string;
    static getPreviousMonth(): string;
    static getNextMonth(): string;
    static getMonthName(monthString: string): string;
    static getMonthsBetween(startDate: Date | string, endDate: Date | string): string[];
    static addDays(date: Date | string, days: number): Date;
    static addMonths(date: Date | string, months: number): Date;
    static addYears(date: Date | string, years: number): Date;
    static getDaysBetween(startDate: Date | string, endDate: Date | string): number;
    static getMonthsBetweenCount(startDate: Date | string, endDate: Date | string): number;
    static getYearsBetween(startDate: Date | string, endDate: Date | string): number;
    static isDateInPast(date: Date | string): boolean;
    static isDateInFuture(date: Date | string): boolean;
    static isDateToday(date: Date | string): boolean;
    static getStartOfMonth(date: Date | string): Date;
    static getEndOfMonth(date: Date | string): Date;
    static getStartOfDay(date: Date | string): Date;
    static getEndOfDay(date: Date | string): Date;
    static isValidDate(date: Date | string): boolean;
    static parseDate(dateString: string): Date;
    static getAgeInYears(birthDate: Date | string): number;
    static getBusinessDaysBetween(startDate: Date | string, endDate: Date | string): number;
    static formatRelativeTime(date: Date | string): string;
    static getFiscalYear(date?: Date): number;
    static getQuarter(date?: Date): number;
}
//# sourceMappingURL=date.utils.d.ts.map