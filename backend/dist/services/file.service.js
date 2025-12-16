"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const index_1 = require("../config/index");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
class FileService {
    constructor() {
        this.upload = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (_req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    cb(new Error('Invalid file type'));
                }
            },
        });
    }
    getMulterConfig() {
        return this.upload;
    }
    async saveFile(file, userId, type) {
        // Create directory if it doesn't exist
        const userDir = path_1.default.join(index_1.config.uploadPath, userId, type);
        await promises_1.default.mkdir(userDir, { recursive: true });
        // Generate unique filename
        const fileExt = path_1.default.extname(file.originalname);
        const fileName = `${(0, uuid_1.v4)()}${fileExt}`;
        const filePath = path_1.default.join(userDir, fileName);
        // Save file
        await promises_1.default.writeFile(filePath, file.buffer);
        // Return relative path for storage in database
        return path_1.default.join(userId, type, fileName);
    }
    async deleteFile(filePath) {
        try {
            const fullPath = path_1.default.join(index_1.config.uploadPath, filePath);
            await promises_1.default.unlink(fullPath);
        }
        catch (error) {
            console.warn('Failed to delete file:', error);
            // Don't throw error for file deletion failures
        }
    }
    async getFile(filePath) {
        const fullPath = path_1.default.join(index_1.config.uploadPath, filePath);
        return promises_1.default.readFile(fullPath);
    }
    async fileExists(filePath) {
        try {
            const fullPath = path_1.default.join(index_1.config.uploadPath, filePath);
            await promises_1.default.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async validateFile(file, options = {}) {
        const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'] } = options;
        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
            };
        }
        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
            };
        }
        return { valid: true };
    }
    async cleanupOldFiles(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            // This is a simplified implementation
            // In production, you might want to track file creation dates in the database
            console.log(`File cleanup for files older than ${daysOld} days would run here`);
            return 0;
        }
        catch (error) {
            console.error('File cleanup error:', error);
            return 0;
        }
    }
}
exports.FileService = FileService;
