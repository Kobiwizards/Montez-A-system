"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = void 0;
const zod_1 = require("zod");
class Validators {
    static validateKenyanID(id) {
        // Basic Kenyan ID validation (simplified)
        const regex = /^\d{8,9}$/;
        return regex.test(id);
    }
    static validateKRApin(pin) {
        // Basic KRA PIN validation (simplified)
        const regex = /^[A-Z]\d{9}[A-Z]$/;
        return regex.test(pin);
    }
    static validateMpesaCode(code) {
        // M-Pesa transaction code validation
        const regex = /^[A-Z0-9]{10}$/;
        return regex.test(code);
    }
    static validateCoordinates(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
    static validateURL(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static validateEmailList(emails) {
        const emailSchema = zod_1.z.string().email();
        const valid = [];
        const invalid = [];
        emails.forEach(email => {
            try {
                emailSchema.parse(email);
                valid.push(email);
            }
            catch {
                invalid.push(email);
            }
        });
        return { valid, invalid };
    }
    static validatePhoneList(phones) {
        const valid = [];
        const invalid = [];
        phones.forEach(phone => {
            if (this.phone.safeParse(phone).success) {
                valid.push(phone);
            }
            else {
                invalid.push(phone);
            }
        });
        return { valid, invalid };
    }
    static sanitizeInput(input) {
        // Remove potentially dangerous characters
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/script/gi, '') // Remove script tags
            .trim();
    }
    static sanitizeObject(obj) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeInput(value);
            }
            else if (Array.isArray(value)) {
                sanitized[key] = value.map(item => typeof item === 'string' ? this.sanitizeInput(item) : item);
            }
            else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeObject(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    static validatePasswordStrength(password) {
        const suggestions = [];
        let score = 0;
        // Length check
        if (password.length >= 8)
            score += 1;
        if (password.length >= 12)
            score += 1;
        if (password.length < 8)
            suggestions.push('Use at least 8 characters');
        // Character variety
        if (/[a-z]/.test(password))
            score += 1;
        if (/[A-Z]/.test(password))
            score += 1;
        if (/\d/.test(password))
            score += 1;
        if (/[^A-Za-z0-9]/.test(password))
            score += 1;
        if (!/[a-z]/.test(password))
            suggestions.push('Add lowercase letters');
        if (!/[A-Z]/.test(password))
            suggestions.push('Add uppercase letters');
        if (!/\d/.test(password))
            suggestions.push('Add numbers');
        if (!/[^A-Za-z0-9]/.test(password))
            suggestions.push('Add special characters');
        // Determine strength
        let strength;
        if (score <= 2)
            strength = 'Weak';
        else if (score === 3)
            strength = 'Fair';
        else if (score === 4)
            strength = 'Good';
        else if (score === 5)
            strength = 'Strong';
        else
            strength = 'Very Strong';
        return { score, strength, suggestions };
    }
    static validateBusinessHours(hours) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(hours.open) || !timeRegex.test(hours.close)) {
            return false;
        }
        const [openHour, openMinute] = hours.open.split(':').map(Number);
        const [closeHour, closeMinute] = hours.close.split(':').map(Number);
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;
        return openTime < closeTime;
    }
    static validatePostalCode(code, country = 'KE') {
        if (country === 'KE') {
            // Kenyan postal codes are 5 digits
            return /^\d{5}$/.test(code);
        }
        // Add other country validations as needed
        return true;
    }
}
exports.Validators = Validators;
Validators.email = zod_1.z.string().email('Invalid email address');
Validators.phone = zod_1.z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number. Format: +2547XXXXXXXX or 07XXXXXXXX');
Validators.password = zod_1.z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
Validators.username = zod_1.z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');
Validators.apartmentNumber = zod_1.z.string()
    .regex(/^[1-6][AB][12]$/, 'Invalid apartment number. Format: 1A1, 2B2, etc.');
Validators.amount = zod_1.z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large');
Validators.month = zod_1.z.string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
    .refine((val) => {
    const monthNum = parseInt(val.split('-')[1]);
    return monthNum >= 1 && monthNum <= 12;
}, 'Month must be between 01 and 12');
Validators.date = zod_1.z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format');
Validators.transactionCode = zod_1.z.string()
    .regex(/^[A-Z0-9]{8,12}$/, 'Invalid transaction code format')
    .optional();
Validators.caretakerName = zod_1.z.string()
    .min(2, 'Caretaker name must be at least 2 characters')
    .max(100, 'Caretaker name must be less than 100 characters')
    .optional();
Validators.description = zod_1.z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional();
Validators.notes = zod_1.z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional();
Validators.emergencyContact = zod_1.z.string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Invalid emergency contact number')
    .optional();
Validators.waterReading = zod_1.z.number()
    .int('Reading must be a whole number')
    .nonnegative('Reading cannot be negative')
    .max(10000, 'Reading is too large');
Validators.fileSize = (maxSize) => zod_1.z.instanceof(Buffer)
    .refine((buf) => buf.length <= maxSize, `File size must be less than ${maxSize / 1024 / 1024}MB`);
Validators.fileType = (allowedTypes) => zod_1.z.string()
    .refine((type) => allowedTypes.includes(type), `File type must be one of: ${allowedTypes.join(', ')}`);
