"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.fileSchemas = exports.analyticsSchemas = exports.maintenanceSchemas = exports.waterReadingSchemas = exports.tenantSchemas = exports.paymentSchemas = exports.authSchemas = exports.validate = void 0;
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Check if it's a ValidationSchema with body/query/params
            if ('body' in schema || 'query' in schema || 'params' in schema) {
                const validationSchema = {
                    body: schema.body || zod_1.z.object({}).strict(),
                    query: schema.query || zod_1.z.object({}).strict(),
                    params: schema.params || zod_1.z.object({}).strict(),
                };
                // Validate each part separately
                const bodyResult = validationSchema.body?.safeParse(req.body);
                const queryResult = validationSchema.query?.safeParse(req.query);
                const paramsResult = validationSchema.params?.safeParse(req.params);
                const errors = [];
                if (bodyResult && !bodyResult.success)
                    errors.push(...bodyResult.error.errors);
                if (queryResult && !queryResult.success)
                    errors.push(...queryResult.error.errors);
                if (paramsResult && !paramsResult.success)
                    errors.push(...paramsResult.error.errors);
                if (errors.length > 0) {
                    const zodError = new zod_1.ZodError(errors);
                    const validationError = (0, zod_validation_error_1.fromZodError)(zodError); // Type assertion
                    res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: validationError.details,
                    });
                    return;
                }
            }
            else {
                // It's a direct ZodSchema
                schema.parse(req.body);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationError = (0, zod_validation_error_1.fromZodError)(error); // Type assertion
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationError.details,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
// Common validation schemas
exports.authSchemas = {
    login: {
        body: zod_1.z.object({
            email: zod_1.z.string().email('Invalid email address'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        }),
    },
    register: {
        body: zod_1.z.object({
            email: zod_1.z.string().email('Invalid email address'),
            phone: zod_1.z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            apartment: zod_1.z.string(),
            unitType: zod_1.z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']),
            moveInDate: zod_1.z.string().datetime(),
            emergencyContact: zod_1.z.string().optional(),
        }),
    },
    changePassword: {
        body: zod_1.z.object({
            currentPassword: zod_1.z.string().min(6, 'Current password is required'),
            newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
            confirmPassword: zod_1.z.string().min(6, 'Confirm password is required'),
        }).refine(data => data.newPassword === data.confirmPassword, {
            message: "Passwords don't match",
            path: ["confirmPassword"],
        }),
    },
    refreshToken: {
        body: zod_1.z.object({
            refreshToken: zod_1.z.string(),
        }),
    },
};
exports.paymentSchemas = {
    create: {
        body: zod_1.z.object({
            type: zod_1.z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER']),
            method: zod_1.z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK']),
            amount: zod_1.z.number().positive('Amount must be positive'),
            month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
            description: zod_1.z.string().optional(),
            transactionCode: zod_1.z.string().optional(),
            caretakerName: zod_1.z.string().optional(),
        }).superRefine((data, ctx) => {
            // M-Pesa payments require transaction code
            if (data.method === 'MPESA' && !data.transactionCode) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: 'Transaction code is required for M-Pesa payments',
                    path: ['transactionCode'],
                });
            }
            // Cash payments require caretaker name
            if (data.method === 'CASH' && !data.caretakerName) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: 'Caretaker name is required for cash payments',
                    path: ['caretakerName'],
                });
            }
        }),
    },
    update: {
        params: zod_1.z.object({
            id: zod_1.z.string().cuid('Invalid payment ID'),
        }),
        body: zod_1.z.object({
            status: zod_1.z.enum(['VERIFIED', 'REJECTED', 'CANCELLED']).optional(),
            adminNotes: zod_1.z.string().optional(),
        }),
    },
    verify: {
        params: zod_1.z.object({
            id: zod_1.z.string().cuid('Invalid payment ID'),
        }),
        body: zod_1.z.object({
            status: zod_1.z.enum(['VERIFIED', 'REJECTED']),
            adminNotes: zod_1.z.string().optional(),
        }),
    },
    filter: {
        query: zod_1.z.object({
            status: zod_1.z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'CANCELLED']).optional(),
            type: zod_1.z.enum(['RENT', 'WATER', 'MAINTENANCE', 'OTHER']).optional(),
            month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
            method: zod_1.z.enum(['MPESA', 'CASH', 'BANK_TRANSFER', 'CHECK']).optional(),
            tenantId: zod_1.z.string().cuid('Invalid tenant ID').optional(),
            page: zod_1.z.string().regex(/^\d+$/).transform(Number).default('1'),
            limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default('20'),
            sortBy: zod_1.z.string().optional(),
            sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
        }),
    },
};
exports.tenantSchemas = {
    create: {
        body: zod_1.z.object({
            email: zod_1.z.string().email('Invalid email address'),
            phone: zod_1.z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number'),
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            apartment: zod_1.z.string(),
            unitType: zod_1.z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']),
            rentAmount: zod_1.z.number().positive('Rent amount must be positive'),
            moveInDate: zod_1.z.string().datetime(),
            leaseEndDate: zod_1.z.string().datetime().optional(),
            emergencyContact: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
        }),
    },
    update: {
        params: zod_1.z.object({
            id: zod_1.z.string().cuid('Invalid tenant ID'),
        }),
        body: zod_1.z.object({
            email: zod_1.z.string().email('Invalid email address').optional(),
            phone: zod_1.z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number').optional(),
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
            apartment: zod_1.z.string().optional(),
            unitType: zod_1.z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']).optional(),
            rentAmount: zod_1.z.number().positive('Rent amount must be positive').optional(),
            status: zod_1.z.enum(['CURRENT', 'OVERDUE', 'DELINQUENT', 'EVICTED', 'FORMER']).optional(),
            moveInDate: zod_1.z.string().datetime().optional(),
            leaseEndDate: zod_1.z.string().datetime().optional(),
            emergencyContact: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
        }),
    },
    filter: {
        query: zod_1.z.object({
            status: zod_1.z.enum(['CURRENT', 'OVERDUE', 'DELINQUENT', 'EVICTED', 'FORMER']).optional(),
            unitType: zod_1.z.enum(['ONE_BEDROOM', 'TWO_BEDROOM']).optional(),
            floor: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
            apartment: zod_1.z.string().optional(),
            search: zod_1.z.string().optional(),
            page: zod_1.z.string().regex(/^\d+$/).transform(Number).default('1'),
            limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default('20'),
            sortBy: zod_1.z.string().optional(),
            sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
        }),
    },
    balance: {
        params: zod_1.z.object({
            id: zod_1.z.string().cuid('Invalid tenant ID'),
        }),
        body: zod_1.z.object({
            amount: zod_1.z.number().positive('Amount must be positive'),
            type: zod_1.z.enum(['add', 'subtract']),
            reason: zod_1.z.string().min(5, 'Reason must be at least 5 characters'),
        }),
    },
};
exports.waterReadingSchemas = {
    create: {
        body: zod_1.z.object({
            previousReading: zod_1.z.number().int().nonnegative('Previous reading must be non-negative'),
            currentReading: zod_1.z.number().int().nonnegative('Current reading must be non-negative'),
            month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
        }).refine(data => data.currentReading > data.previousReading, {
            message: 'Current reading must be greater than previous reading',
            path: ['currentReading'],
        }),
    },
    update: {
        params: zod_1.z.object({
            id: zod_1.z.string().cuid('Invalid reading ID'),
        }),
        body: zod_1.z.object({
            previousReading: zod_1.z.number().int().nonnegative('Previous reading must be non-negative').optional(),
            currentReading: zod_1.z.number().int().nonnegative('Current reading must be non-negative').optional(),
        }).refine(data => {
            if (data.currentReading !== undefined && data.previousReading !== undefined) {
                return data.currentReading > data.previousReading;
            }
            return true;
        }, {
            message: 'Current reading must be greater than previous reading',
            path: ['currentReading'],
        }),
    },
    filter: {
        query: zod_1.z.object({
            month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
            paid: zod_1.z.enum(['true', 'false']).transform(val => val === 'true').optional(),
            tenantId: zod_1.z.string().cuid('Invalid tenant ID').optional(),
            page: zod_1.z.string().regex(/^\d+$/).transform(Number).default('1'),
            limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default('20'),
        }),
    },
};
exports.maintenanceSchemas = {
    create: {
        body: zod_1.z.object({
            title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
            description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
            priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
            location: zod_1.z.string().optional(),
        }),
    },
    update: {
        params: zod_1.z.object({
            id: zod_1.z.string().cuid('Invalid maintenance request ID'),
        }),
        body: zod_1.z.object({
            status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
            priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
            resolutionNotes: zod_1.z.string().optional(),
            cost: zod_1.z.number().positive('Cost must be positive').optional(),
        }),
    },
    filter: {
        query: zod_1.z.object({
            status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
            priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
            tenantId: zod_1.z.string().cuid('Invalid tenant ID').optional(),
            page: zod_1.z.string().regex(/^\d+$/).transform(Number).default('1'),
            limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default('20'),
        }),
    },
};
exports.analyticsSchemas = {
    getMetrics: {
        query: zod_1.z.object({
            startDate: zod_1.z.string().datetime().optional(),
            endDate: zod_1.z.string().datetime().optional(),
            period: zod_1.z.enum(['day', 'week', 'month', 'year']).optional(),
        }),
    },
    export: {
        query: zod_1.z.object({
            format: zod_1.z.enum(['json', 'csv', 'pdf']).default('json'),
            type: zod_1.z.enum(['payments', 'tenants', 'water', 'maintenance']),
            startDate: zod_1.z.string().datetime().optional(),
            endDate: zod_1.z.string().datetime().optional(),
        }),
    },
};
exports.fileSchemas = {
    upload: {
        body: zod_1.z.object({
            type: zod_1.z.enum(['payment', 'maintenance', 'contract', 'id_copy']),
            description: zod_1.z.string().optional(),
        }),
    },
};
// Re-export everything in one object for easy import
exports.schemas = {
    auth: exports.authSchemas,
    payment: exports.paymentSchemas,
    tenant: exports.tenantSchemas,
    water: exports.waterReadingSchemas,
    maintenance: exports.maintenanceSchemas,
    analytics: exports.analyticsSchemas,
    file: exports.fileSchemas,
};
//# sourceMappingURL=validation.middleware.js.map