import { Request, Response, NextFunction } from 'express';
import { z, AnyZodObject, ZodSchema, ZodEffects } from 'zod';
interface ValidationSchema {
    body?: AnyZodObject | ZodEffects<any, any>;
    query?: AnyZodObject;
    params?: AnyZodObject;
}
export declare const validate: (schema: ZodSchema<any> | ValidationSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authSchemas: {
    login: {
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
    };
    register: {
        body: z.ZodObject<{
            email: z.ZodString;
            phone: z.ZodString;
            password: z.ZodString;
            name: z.ZodString;
            apartment: z.ZodString;
            unitType: z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>;
            moveInDate: z.ZodString;
            emergencyContact: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            phone: string;
            apartment: string;
            password: string;
            name: string;
            unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
            moveInDate: string;
            emergencyContact?: string | undefined;
        }, {
            email: string;
            phone: string;
            apartment: string;
            password: string;
            name: string;
            unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
            moveInDate: string;
            emergencyContact?: string | undefined;
        }>;
    };
    changePassword: {
        body: z.ZodEffects<z.ZodObject<{
            currentPassword: z.ZodString;
            newPassword: z.ZodString;
            confirmPassword: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        }, {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        }>, {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        }, {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        }>;
    };
    refreshToken: {
        body: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
        }, {
            refreshToken: string;
        }>;
    };
};
export declare const paymentSchemas: {
    create: {
        body: z.ZodEffects<z.ZodObject<{
            type: z.ZodEnum<["RENT", "WATER", "MAINTENANCE", "OTHER"]>;
            method: z.ZodEnum<["MPESA", "CASH", "BANK_TRANSFER", "CHECK"]>;
            amount: z.ZodNumber;
            month: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            transactionCode: z.ZodOptional<z.ZodString>;
            caretakerName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            month: string;
            type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
            method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
            amount: number;
            description?: string | undefined;
            transactionCode?: string | undefined;
            caretakerName?: string | undefined;
        }, {
            month: string;
            type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
            method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
            amount: number;
            description?: string | undefined;
            transactionCode?: string | undefined;
            caretakerName?: string | undefined;
        }>, {
            month: string;
            type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
            method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
            amount: number;
            description?: string | undefined;
            transactionCode?: string | undefined;
            caretakerName?: string | undefined;
        }, {
            month: string;
            type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
            method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
            amount: number;
            description?: string | undefined;
            transactionCode?: string | undefined;
            caretakerName?: string | undefined;
        }>;
    };
    update: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            status: z.ZodOptional<z.ZodEnum<["VERIFIED", "REJECTED", "CANCELLED"]>>;
            adminNotes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: "VERIFIED" | "REJECTED" | "CANCELLED" | undefined;
            adminNotes?: string | undefined;
        }, {
            status?: "VERIFIED" | "REJECTED" | "CANCELLED" | undefined;
            adminNotes?: string | undefined;
        }>;
    };
    verify: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            status: z.ZodEnum<["VERIFIED", "REJECTED"]>;
            adminNotes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "VERIFIED" | "REJECTED";
            adminNotes?: string | undefined;
        }, {
            status: "VERIFIED" | "REJECTED";
            adminNotes?: string | undefined;
        }>;
    };
    filter: {
        query: z.ZodObject<{
            status: z.ZodOptional<z.ZodEnum<["PENDING", "VERIFIED", "REJECTED", "CANCELLED"]>>;
            type: z.ZodOptional<z.ZodEnum<["RENT", "WATER", "MAINTENANCE", "OTHER"]>>;
            month: z.ZodOptional<z.ZodString>;
            method: z.ZodOptional<z.ZodEnum<["MPESA", "CASH", "BANK_TRANSFER", "CHECK"]>>;
            tenantId: z.ZodOptional<z.ZodString>;
            page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            sortBy: z.ZodOptional<z.ZodString>;
            sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            status?: "VERIFIED" | "REJECTED" | "CANCELLED" | "PENDING" | undefined;
            month?: string | undefined;
            type?: "RENT" | "WATER" | "MAINTENANCE" | "OTHER" | undefined;
            method?: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK" | undefined;
            tenantId?: string | undefined;
            sortBy?: string | undefined;
            sortOrder?: "asc" | "desc" | undefined;
        }, {
            status?: "VERIFIED" | "REJECTED" | "CANCELLED" | "PENDING" | undefined;
            page?: string | undefined;
            limit?: string | undefined;
            month?: string | undefined;
            type?: "RENT" | "WATER" | "MAINTENANCE" | "OTHER" | undefined;
            method?: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK" | undefined;
            tenantId?: string | undefined;
            sortBy?: string | undefined;
            sortOrder?: "asc" | "desc" | undefined;
        }>;
    };
};
export declare const tenantSchemas: {
    create: {
        body: z.ZodObject<{
            email: z.ZodString;
            phone: z.ZodString;
            name: z.ZodString;
            apartment: z.ZodString;
            unitType: z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>;
            rentAmount: z.ZodNumber;
            moveInDate: z.ZodString;
            leaseEndDate: z.ZodOptional<z.ZodString>;
            emergencyContact: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            phone: string;
            apartment: string;
            name: string;
            unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
            rentAmount: number;
            moveInDate: string;
            leaseEndDate?: string | undefined;
            emergencyContact?: string | undefined;
            notes?: string | undefined;
        }, {
            email: string;
            phone: string;
            apartment: string;
            name: string;
            unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
            rentAmount: number;
            moveInDate: string;
            leaseEndDate?: string | undefined;
            emergencyContact?: string | undefined;
            notes?: string | undefined;
        }>;
    };
    update: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            apartment: z.ZodOptional<z.ZodString>;
            unitType: z.ZodOptional<z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>>;
            rentAmount: z.ZodOptional<z.ZodNumber>;
            status: z.ZodOptional<z.ZodEnum<["CURRENT", "OVERDUE", "DELINQUENT", "EVICTED", "FORMER"]>>;
            moveInDate: z.ZodOptional<z.ZodString>;
            leaseEndDate: z.ZodOptional<z.ZodString>;
            emergencyContact: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email?: string | undefined;
            phone?: string | undefined;
            apartment?: string | undefined;
            name?: string | undefined;
            unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
            rentAmount?: number | undefined;
            status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
            moveInDate?: string | undefined;
            leaseEndDate?: string | undefined;
            emergencyContact?: string | undefined;
            notes?: string | undefined;
        }, {
            email?: string | undefined;
            phone?: string | undefined;
            apartment?: string | undefined;
            name?: string | undefined;
            unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
            rentAmount?: number | undefined;
            status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
            moveInDate?: string | undefined;
            leaseEndDate?: string | undefined;
            emergencyContact?: string | undefined;
            notes?: string | undefined;
        }>;
    };
    filter: {
        query: z.ZodObject<{
            status: z.ZodOptional<z.ZodEnum<["CURRENT", "OVERDUE", "DELINQUENT", "EVICTED", "FORMER"]>>;
            unitType: z.ZodOptional<z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>>;
            floor: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
            apartment: z.ZodOptional<z.ZodString>;
            search: z.ZodOptional<z.ZodString>;
            page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            sortBy: z.ZodOptional<z.ZodString>;
            sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            search?: string | undefined;
            apartment?: string | undefined;
            unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
            status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
            sortBy?: string | undefined;
            sortOrder?: "asc" | "desc" | undefined;
            floor?: number | undefined;
        }, {
            search?: string | undefined;
            apartment?: string | undefined;
            unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
            status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
            page?: string | undefined;
            limit?: string | undefined;
            sortBy?: string | undefined;
            sortOrder?: "asc" | "desc" | undefined;
            floor?: string | undefined;
        }>;
    };
    balance: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            amount: z.ZodNumber;
            type: z.ZodEnum<["add", "subtract"]>;
            reason: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "add" | "subtract";
            amount: number;
            reason: string;
        }, {
            type: "add" | "subtract";
            amount: number;
            reason: string;
        }>;
    };
};
export declare const waterReadingSchemas: {
    create: {
        body: z.ZodEffects<z.ZodObject<{
            previousReading: z.ZodNumber;
            currentReading: z.ZodNumber;
            month: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            month: string;
            previousReading: number;
            currentReading: number;
        }, {
            month: string;
            previousReading: number;
            currentReading: number;
        }>, {
            month: string;
            previousReading: number;
            currentReading: number;
        }, {
            month: string;
            previousReading: number;
            currentReading: number;
        }>;
    };
    update: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodEffects<z.ZodObject<{
            previousReading: z.ZodOptional<z.ZodNumber>;
            currentReading: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            previousReading?: number | undefined;
            currentReading?: number | undefined;
        }, {
            previousReading?: number | undefined;
            currentReading?: number | undefined;
        }>, {
            previousReading?: number | undefined;
            currentReading?: number | undefined;
        }, {
            previousReading?: number | undefined;
            currentReading?: number | undefined;
        }>;
    };
    filter: {
        query: z.ZodObject<{
            month: z.ZodOptional<z.ZodString>;
            paid: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
            tenantId: z.ZodOptional<z.ZodString>;
            page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            month?: string | undefined;
            tenantId?: string | undefined;
            paid?: boolean | undefined;
        }, {
            page?: string | undefined;
            limit?: string | undefined;
            month?: string | undefined;
            tenantId?: string | undefined;
            paid?: "true" | "false" | undefined;
        }>;
    };
};
export declare const maintenanceSchemas: {
    create: {
        body: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
            location: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            title: string;
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            location?: string | undefined;
        }, {
            description: string;
            title: string;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            location?: string | undefined;
        }>;
    };
    update: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{
            status: z.ZodOptional<z.ZodEnum<["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
            priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
            resolutionNotes: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            resolutionNotes?: string | undefined;
            cost?: number | undefined;
        }, {
            status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            resolutionNotes?: string | undefined;
            cost?: number | undefined;
        }>;
    };
    filter: {
        query: z.ZodObject<{
            status: z.ZodOptional<z.ZodEnum<["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
            priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
            tenantId: z.ZodOptional<z.ZodString>;
            page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
            tenantId?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
        }, {
            status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
            page?: string | undefined;
            limit?: string | undefined;
            tenantId?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
        }>;
    };
};
export declare const analyticsSchemas: {
    getMetrics: {
        query: z.ZodObject<{
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            period: z.ZodOptional<z.ZodEnum<["day", "week", "month", "year"]>>;
        }, "strip", z.ZodTypeAny, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            period?: "year" | "week" | "day" | "month" | undefined;
        }, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            period?: "year" | "week" | "day" | "month" | undefined;
        }>;
    };
    export: {
        query: z.ZodObject<{
            format: z.ZodDefault<z.ZodEnum<["json", "csv", "pdf"]>>;
            type: z.ZodEnum<["payments", "tenants", "water", "maintenance"]>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "payments" | "tenants" | "water" | "maintenance";
            format: "json" | "csv" | "pdf";
            startDate?: string | undefined;
            endDate?: string | undefined;
        }, {
            type: "payments" | "tenants" | "water" | "maintenance";
            startDate?: string | undefined;
            endDate?: string | undefined;
            format?: "json" | "csv" | "pdf" | undefined;
        }>;
    };
};
export declare const fileSchemas: {
    upload: {
        body: z.ZodObject<{
            type: z.ZodEnum<["payment", "maintenance", "contract", "id_copy"]>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "payment" | "maintenance" | "contract" | "id_copy";
            description?: string | undefined;
        }, {
            type: "payment" | "maintenance" | "contract" | "id_copy";
            description?: string | undefined;
        }>;
    };
};
export declare const schemas: {
    auth: {
        login: {
            body: z.ZodObject<{
                email: z.ZodString;
                password: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                email: string;
                password: string;
            }, {
                email: string;
                password: string;
            }>;
        };
        register: {
            body: z.ZodObject<{
                email: z.ZodString;
                phone: z.ZodString;
                password: z.ZodString;
                name: z.ZodString;
                apartment: z.ZodString;
                unitType: z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>;
                moveInDate: z.ZodString;
                emergencyContact: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                phone: string;
                apartment: string;
                password: string;
                name: string;
                unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
                moveInDate: string;
                emergencyContact?: string | undefined;
            }, {
                email: string;
                phone: string;
                apartment: string;
                password: string;
                name: string;
                unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
                moveInDate: string;
                emergencyContact?: string | undefined;
            }>;
        };
        changePassword: {
            body: z.ZodEffects<z.ZodObject<{
                currentPassword: z.ZodString;
                newPassword: z.ZodString;
                confirmPassword: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currentPassword: string;
                newPassword: string;
                confirmPassword: string;
            }, {
                currentPassword: string;
                newPassword: string;
                confirmPassword: string;
            }>, {
                currentPassword: string;
                newPassword: string;
                confirmPassword: string;
            }, {
                currentPassword: string;
                newPassword: string;
                confirmPassword: string;
            }>;
        };
        refreshToken: {
            body: z.ZodObject<{
                refreshToken: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                refreshToken: string;
            }, {
                refreshToken: string;
            }>;
        };
    };
    payment: {
        create: {
            body: z.ZodEffects<z.ZodObject<{
                type: z.ZodEnum<["RENT", "WATER", "MAINTENANCE", "OTHER"]>;
                method: z.ZodEnum<["MPESA", "CASH", "BANK_TRANSFER", "CHECK"]>;
                amount: z.ZodNumber;
                month: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                transactionCode: z.ZodOptional<z.ZodString>;
                caretakerName: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                month: string;
                type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
                method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
                amount: number;
                description?: string | undefined;
                transactionCode?: string | undefined;
                caretakerName?: string | undefined;
            }, {
                month: string;
                type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
                method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
                amount: number;
                description?: string | undefined;
                transactionCode?: string | undefined;
                caretakerName?: string | undefined;
            }>, {
                month: string;
                type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
                method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
                amount: number;
                description?: string | undefined;
                transactionCode?: string | undefined;
                caretakerName?: string | undefined;
            }, {
                month: string;
                type: "RENT" | "WATER" | "MAINTENANCE" | "OTHER";
                method: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK";
                amount: number;
                description?: string | undefined;
                transactionCode?: string | undefined;
                caretakerName?: string | undefined;
            }>;
        };
        update: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodObject<{
                status: z.ZodOptional<z.ZodEnum<["VERIFIED", "REJECTED", "CANCELLED"]>>;
                adminNotes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                status?: "VERIFIED" | "REJECTED" | "CANCELLED" | undefined;
                adminNotes?: string | undefined;
            }, {
                status?: "VERIFIED" | "REJECTED" | "CANCELLED" | undefined;
                adminNotes?: string | undefined;
            }>;
        };
        verify: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodObject<{
                status: z.ZodEnum<["VERIFIED", "REJECTED"]>;
                adminNotes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                status: "VERIFIED" | "REJECTED";
                adminNotes?: string | undefined;
            }, {
                status: "VERIFIED" | "REJECTED";
                adminNotes?: string | undefined;
            }>;
        };
        filter: {
            query: z.ZodObject<{
                status: z.ZodOptional<z.ZodEnum<["PENDING", "VERIFIED", "REJECTED", "CANCELLED"]>>;
                type: z.ZodOptional<z.ZodEnum<["RENT", "WATER", "MAINTENANCE", "OTHER"]>>;
                month: z.ZodOptional<z.ZodString>;
                method: z.ZodOptional<z.ZodEnum<["MPESA", "CASH", "BANK_TRANSFER", "CHECK"]>>;
                tenantId: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
                limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
                sortBy: z.ZodOptional<z.ZodString>;
                sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
            }, "strip", z.ZodTypeAny, {
                page: number;
                limit: number;
                status?: "VERIFIED" | "REJECTED" | "CANCELLED" | "PENDING" | undefined;
                month?: string | undefined;
                type?: "RENT" | "WATER" | "MAINTENANCE" | "OTHER" | undefined;
                method?: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK" | undefined;
                tenantId?: string | undefined;
                sortBy?: string | undefined;
                sortOrder?: "asc" | "desc" | undefined;
            }, {
                status?: "VERIFIED" | "REJECTED" | "CANCELLED" | "PENDING" | undefined;
                page?: string | undefined;
                limit?: string | undefined;
                month?: string | undefined;
                type?: "RENT" | "WATER" | "MAINTENANCE" | "OTHER" | undefined;
                method?: "MPESA" | "CASH" | "BANK_TRANSFER" | "CHECK" | undefined;
                tenantId?: string | undefined;
                sortBy?: string | undefined;
                sortOrder?: "asc" | "desc" | undefined;
            }>;
        };
    };
    tenant: {
        create: {
            body: z.ZodObject<{
                email: z.ZodString;
                phone: z.ZodString;
                name: z.ZodString;
                apartment: z.ZodString;
                unitType: z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>;
                rentAmount: z.ZodNumber;
                moveInDate: z.ZodString;
                leaseEndDate: z.ZodOptional<z.ZodString>;
                emergencyContact: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                phone: string;
                apartment: string;
                name: string;
                unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
                rentAmount: number;
                moveInDate: string;
                leaseEndDate?: string | undefined;
                emergencyContact?: string | undefined;
                notes?: string | undefined;
            }, {
                email: string;
                phone: string;
                apartment: string;
                name: string;
                unitType: "ONE_BEDROOM" | "TWO_BEDROOM";
                rentAmount: number;
                moveInDate: string;
                leaseEndDate?: string | undefined;
                emergencyContact?: string | undefined;
                notes?: string | undefined;
            }>;
        };
        update: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodObject<{
                email: z.ZodOptional<z.ZodString>;
                phone: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                apartment: z.ZodOptional<z.ZodString>;
                unitType: z.ZodOptional<z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>>;
                rentAmount: z.ZodOptional<z.ZodNumber>;
                status: z.ZodOptional<z.ZodEnum<["CURRENT", "OVERDUE", "DELINQUENT", "EVICTED", "FORMER"]>>;
                moveInDate: z.ZodOptional<z.ZodString>;
                leaseEndDate: z.ZodOptional<z.ZodString>;
                emergencyContact: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                email?: string | undefined;
                phone?: string | undefined;
                apartment?: string | undefined;
                name?: string | undefined;
                unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
                rentAmount?: number | undefined;
                status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
                moveInDate?: string | undefined;
                leaseEndDate?: string | undefined;
                emergencyContact?: string | undefined;
                notes?: string | undefined;
            }, {
                email?: string | undefined;
                phone?: string | undefined;
                apartment?: string | undefined;
                name?: string | undefined;
                unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
                rentAmount?: number | undefined;
                status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
                moveInDate?: string | undefined;
                leaseEndDate?: string | undefined;
                emergencyContact?: string | undefined;
                notes?: string | undefined;
            }>;
        };
        filter: {
            query: z.ZodObject<{
                status: z.ZodOptional<z.ZodEnum<["CURRENT", "OVERDUE", "DELINQUENT", "EVICTED", "FORMER"]>>;
                unitType: z.ZodOptional<z.ZodEnum<["ONE_BEDROOM", "TWO_BEDROOM"]>>;
                floor: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
                apartment: z.ZodOptional<z.ZodString>;
                search: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
                limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
                sortBy: z.ZodOptional<z.ZodString>;
                sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
            }, "strip", z.ZodTypeAny, {
                page: number;
                limit: number;
                search?: string | undefined;
                apartment?: string | undefined;
                unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
                status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
                sortBy?: string | undefined;
                sortOrder?: "asc" | "desc" | undefined;
                floor?: number | undefined;
            }, {
                search?: string | undefined;
                apartment?: string | undefined;
                unitType?: "ONE_BEDROOM" | "TWO_BEDROOM" | undefined;
                status?: "CURRENT" | "OVERDUE" | "DELINQUENT" | "EVICTED" | "FORMER" | undefined;
                page?: string | undefined;
                limit?: string | undefined;
                sortBy?: string | undefined;
                sortOrder?: "asc" | "desc" | undefined;
                floor?: string | undefined;
            }>;
        };
        balance: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodObject<{
                amount: z.ZodNumber;
                type: z.ZodEnum<["add", "subtract"]>;
                reason: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "add" | "subtract";
                amount: number;
                reason: string;
            }, {
                type: "add" | "subtract";
                amount: number;
                reason: string;
            }>;
        };
    };
    water: {
        create: {
            body: z.ZodEffects<z.ZodObject<{
                previousReading: z.ZodNumber;
                currentReading: z.ZodNumber;
                month: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                month: string;
                previousReading: number;
                currentReading: number;
            }, {
                month: string;
                previousReading: number;
                currentReading: number;
            }>, {
                month: string;
                previousReading: number;
                currentReading: number;
            }, {
                month: string;
                previousReading: number;
                currentReading: number;
            }>;
        };
        update: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodEffects<z.ZodObject<{
                previousReading: z.ZodOptional<z.ZodNumber>;
                currentReading: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                previousReading?: number | undefined;
                currentReading?: number | undefined;
            }, {
                previousReading?: number | undefined;
                currentReading?: number | undefined;
            }>, {
                previousReading?: number | undefined;
                currentReading?: number | undefined;
            }, {
                previousReading?: number | undefined;
                currentReading?: number | undefined;
            }>;
        };
        filter: {
            query: z.ZodObject<{
                month: z.ZodOptional<z.ZodString>;
                paid: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
                tenantId: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
                limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            }, "strip", z.ZodTypeAny, {
                page: number;
                limit: number;
                month?: string | undefined;
                tenantId?: string | undefined;
                paid?: boolean | undefined;
            }, {
                page?: string | undefined;
                limit?: string | undefined;
                month?: string | undefined;
                tenantId?: string | undefined;
                paid?: "true" | "false" | undefined;
            }>;
        };
    };
    maintenance: {
        create: {
            body: z.ZodObject<{
                title: z.ZodString;
                description: z.ZodString;
                priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
                location: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                title: string;
                priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
                location?: string | undefined;
            }, {
                description: string;
                title: string;
                priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
                location?: string | undefined;
            }>;
        };
        update: {
            params: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            body: z.ZodObject<{
                status: z.ZodOptional<z.ZodEnum<["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
                priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
                resolutionNotes: z.ZodOptional<z.ZodString>;
                cost: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
                priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
                resolutionNotes?: string | undefined;
                cost?: number | undefined;
            }, {
                status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
                priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
                resolutionNotes?: string | undefined;
                cost?: number | undefined;
            }>;
        };
        filter: {
            query: z.ZodObject<{
                status: z.ZodOptional<z.ZodEnum<["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
                priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
                tenantId: z.ZodOptional<z.ZodString>;
                page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
                limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
            }, "strip", z.ZodTypeAny, {
                page: number;
                limit: number;
                status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
                tenantId?: string | undefined;
                priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            }, {
                status?: "CANCELLED" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined;
                page?: string | undefined;
                limit?: string | undefined;
                tenantId?: string | undefined;
                priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            }>;
        };
    };
    analytics: {
        getMetrics: {
            query: z.ZodObject<{
                startDate: z.ZodOptional<z.ZodString>;
                endDate: z.ZodOptional<z.ZodString>;
                period: z.ZodOptional<z.ZodEnum<["day", "week", "month", "year"]>>;
            }, "strip", z.ZodTypeAny, {
                startDate?: string | undefined;
                endDate?: string | undefined;
                period?: "year" | "week" | "day" | "month" | undefined;
            }, {
                startDate?: string | undefined;
                endDate?: string | undefined;
                period?: "year" | "week" | "day" | "month" | undefined;
            }>;
        };
        export: {
            query: z.ZodObject<{
                format: z.ZodDefault<z.ZodEnum<["json", "csv", "pdf"]>>;
                type: z.ZodEnum<["payments", "tenants", "water", "maintenance"]>;
                startDate: z.ZodOptional<z.ZodString>;
                endDate: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "payments" | "tenants" | "water" | "maintenance";
                format: "json" | "csv" | "pdf";
                startDate?: string | undefined;
                endDate?: string | undefined;
            }, {
                type: "payments" | "tenants" | "water" | "maintenance";
                startDate?: string | undefined;
                endDate?: string | undefined;
                format?: "json" | "csv" | "pdf" | undefined;
            }>;
        };
    };
    file: {
        upload: {
            body: z.ZodObject<{
                type: z.ZodEnum<["payment", "maintenance", "contract", "id_copy"]>;
                description: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "payment" | "maintenance" | "contract" | "id_copy";
                description?: string | undefined;
            }, {
                type: "payment" | "maintenance" | "contract" | "id_copy";
                description?: string | undefined;
            }>;
        };
    };
};
export {};
//# sourceMappingURL=validation.middleware.d.ts.map