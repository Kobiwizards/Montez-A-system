"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const config_1 = require("../config");
const multer_1 = __importDefault(require("multer"));
class FileService {
    constructor() {
        const storage = multer_1.default.memoryStorage();
        this.upload = (0, multer_1.default)({
            storage,
            limits: {
                fileSize: config_1.config.maxFileSize,
            },
            fileFilter: (req, file, cb) => {
                if (config_1.config.allowedFileTypes.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    cb(new Error(`Invalid file type. Allowed types: ${config_1.config.allowedFileTypes.join(', ')}`));
                }
            }
        });
    }
    getMulterConfig() {
        return this.upload;
    }
    async saveFile(file, subfolder = '') {
        const uploadDir = path.join(config_1.config.uploadPath, subfolder);
        // Create directory if it doesn't exist
        await fs.mkdir(uploadDir, { recursive: true });
        // Generate unique filename
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        // Save file - FIX: Use file.buffer directly
        await fs.writeFile(filePath, file.buffer);
        return path.join(subfolder, fileName);
    }
    async deleteFile(filePath) {
        const fullPath = path.join(config_1.config.uploadPath, filePath);
        try {
            await fs.unlink(fullPath);
        }
        catch (error) {
            console.error('Failed to delete file:', error);
        }
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async getFileSize(filePath) {
        const stats = await fs.stat(filePath);
        return stats.size;
    }
    async listFiles(directory) {
        try {
            return await fs.readdir(directory);
        }
        catch (error) {
            console.error('Failed to list files:', error);
            return [];
        }
    }
    async cleanupOldFiles(directory, daysOld = 30) {
        try {
            const files = await this.listFiles(directory);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            for (const file of files) {
                const filePath = path.join(directory, file);
                const stats = await fs.stat(filePath);
                if (stats.mtime < cutoffDate) {
                    await this.deleteFile(filePath);
                }
            }
        }
        catch (error) {
            console.error('Failed to cleanup old files:', error);
        }
    }
}
exports.FileService = FileService;
