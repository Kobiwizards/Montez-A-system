export declare const MONTEZ_A_APARTMENTS: ({
    number: string;
    floor: number;
    type: "TWO_BEDROOM";
    rent: number;
} | {
    number: string;
    floor: number;
    type: "ONE_BEDROOM";
    rent: number;
})[];
export declare const BUILDING_INFO: {
    name: string;
    address: string;
    totalUnits: number;
    floors: number;
    yearBuilt: number;
    amenities: string[];
};
export declare const PAYMENT_CONFIG: {
    dueDate: number;
    gracePeriodDays: number;
    lateFeePercentage: number;
    waterRatePerUnit: number;
    securityDepositMonths: number;
    paymentMethods: readonly ["MPESA", "CASH", "BANK_TRANSFER", "CHECK"];
};
export declare const TENANT_STATUS: {
    readonly CURRENT: "CURRENT";
    readonly OVERDUE: "OVERDUE";
    readonly DELINQUENT: "DELINQUENT";
    readonly EVICTED: "EVICTED";
    readonly FORMER: "FORMER";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "PENDING";
    readonly VERIFIED: "VERIFIED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
};
export declare const MAINTENANCE_PRIORITY: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export declare const MAINTENANCE_STATUS: {
    readonly PENDING: "PENDING";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
export declare const USER_ROLES: {
    readonly ADMIN: "ADMIN";
    readonly TENANT: "TENANT";
};
export declare const NOTIFICATION_TYPES: {
    readonly PAYMENT: "PAYMENT";
    readonly MAINTENANCE: "MAINTENANCE";
    readonly SYSTEM: "SYSTEM";
    readonly ALERT: "ALERT";
};
export declare const AUDIT_ACTIONS: {
    readonly CREATE: "CREATE";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
    readonly VERIFY: "VERIFY";
    readonly REJECT: "REJECT";
    readonly LOGIN: "LOGIN";
    readonly LOGOUT: "LOGOUT";
};
export declare const FILE_CONFIG: {
    maxSize: number;
    allowedTypes: string[];
    maxFilesPerUpload: number;
};
export declare const RATE_LIMITS: {
    windowMs: number;
    max: number;
};
export declare const EMAIL_TEMPLATES: {
    WELCOME: string;
    PAYMENT_RECEIPT: string;
    PAYMENT_REMINDER: string;
    MAINTENANCE_UPDATE: string;
    BALANCE_ALERT: string;
};
export declare const DATE_FORMATS: {
    DISPLAY: string;
    DISPLAY_WITH_TIME: string;
    DATABASE: string;
    DATABASE_WITH_TIME: string;
    MONTH_YEAR: string;
};
export declare const CURRENCY: {
    code: string;
    symbol: string;
    locale: string;
};
export declare const WATER_ESTIMATES: {
    ONE_BEDROOM_PER_PERSON: number;
    TWO_BEDROOM_PER_PERSON: number;
    AVERAGE_OCCUPANCY: number;
};
export declare const RENT_RATES: {
    ONE_BEDROOM: number;
    TWO_BEDROOM: number;
};
export declare const SECURITY: {
    passwordSaltRounds: number;
    jwtExpiry: string;
    refreshTokenExpiry: string;
    sessionTimeout: number;
};
export declare const ANALYTICS: {
    snapshotInterval: number;
    retentionDays: number;
};
export declare const EXPORT_FORMATS: {
    JSON: string;
    CSV: string;
    PDF: string;
    EXCEL: string;
};
export declare const VALIDATION_MESSAGES: {
    REQUIRED: string;
    INVALID_EMAIL: string;
    INVALID_PHONE: string;
    PASSWORD_TOO_SHORT: string;
    PASSWORD_MISMATCH: string;
    INVALID_AMOUNT: string;
    INVALID_DATE: string;
};
export declare const SUCCESS_MESSAGES: {
    PAYMENT_SUBMITTED: string;
    PAYMENT_VERIFIED: string;
    TENANT_CREATED: string;
    TENANT_UPDATED: string;
    RECEIPT_GENERATED: string;
    MAINTENANCE_SUBMITTED: string;
};
export declare const ERROR_MESSAGES: {
    UNAUTHORIZED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    VALIDATION_ERROR: string;
    SERVER_ERROR: string;
    PAYMENT_EXISTS: string;
    APARTMENT_OCCUPIED: string;
    FILE_TOO_LARGE: string;
    INVALID_FILE_TYPE: string;
};
export declare const HTTP_STATUS_CODES: {
    OK: number;
    CREATED: number;
    BAD_REQUEST: number;
    UNAUTHORIZED: number;
    FORBIDDEN: number;
    NOT_FOUND: number;
    CONFLICT: number;
    SERVER_ERROR: number;
};
//# sourceMappingURL=constants.d.ts.map