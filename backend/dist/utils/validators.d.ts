import { z } from 'zod';
export declare class Validators {
    static email: z.ZodString;
    static phone: z.ZodString;
    static password: z.ZodString;
    static username: z.ZodString;
    static apartmentNumber: z.ZodString;
    static amount: z.ZodNumber;
    static month: z.ZodEffects<z.ZodString, string, string>;
    static date: z.ZodEffects<z.ZodString, string, string>;
    static transactionCode: z.ZodOptional<z.ZodString>;
    static caretakerName: z.ZodOptional<z.ZodString>;
    static description: z.ZodOptional<z.ZodString>;
    static notes: z.ZodOptional<z.ZodString>;
    static emergencyContact: z.ZodOptional<z.ZodString>;
    static waterReading: z.ZodNumber;
    static fileSize: (maxSize: number) => z.ZodEffects<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>, Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
    static fileType: (allowedTypes: string[]) => z.ZodEffects<z.ZodString, string, string>;
    static validateKenyanID(id: string): boolean;
    static validateKRApin(pin: string): boolean;
    static validateMpesaCode(code: string): boolean;
    static validateCoordinates(lat: number, lng: number): boolean;
    static validateURL(url: string): boolean;
    static validateEmailList(emails: string[]): {
        valid: string[];
        invalid: string[];
    };
    static validatePhoneList(phones: string[]): {
        valid: string[];
        invalid: string[];
    };
    static sanitizeInput(input: string): string;
    static sanitizeObject<T extends Record<string, any>>(obj: T): T;
    static validatePasswordStrength(password: string): {
        score: number;
        strength: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
        suggestions: string[];
    };
    static validateBusinessHours(hours: {
        open: string;
        close: string;
    }): boolean;
    static validatePostalCode(code: string, country?: string): boolean;
}
//# sourceMappingURL=validators.d.ts.map