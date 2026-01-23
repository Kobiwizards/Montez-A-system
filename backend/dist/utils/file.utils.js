"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class FileUtils {
    static validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
            };
        }
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
            };
        }
        return { valid: true };
    }
    static generateUniqueFilename(originalname) {
        const ext = path_1.default.extname(originalname);
        const basename = path_1.default.basename(originalname, ext);
        const timestamp = Date.now();
        const uniqueId = (0, uuid_1.v4)().slice(0, 8);
        return `${basename}-${timestamp}-${uniqueId}${ext}`;
    }
    static async saveFile(file, destination) {
        const filename = this.generateUniqueFilename(file.originalname);
        const filePath = path_1.default.join(destination, filename);
        // Ensure directory exists
        await fs_1.default.promises.mkdir(destination, { recursive: true });
        // Move file
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        return filename;
    }
    static async deleteFile(filePath) {
        if (fs_1.default.existsSync(filePath)) {
            await fs_1.default.promises.unlink(filePath);
        }
    }
    static async cleanupDirectory(directory, maxAgeDays = 30) {
        if (!fs_1.default.existsSync(directory))
            return;
        const files = await fs_1.default.promises.readdir(directory);
        const cutoff = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
        for (const file of files) {
            const filePath = path_1.default.join(directory, file);
            const stats = await fs_1.default.promises.stat(filePath);
            if (stats.isFile() && stats.mtimeMs < cutoff) {
                await fs_1.default.promises.unlink(filePath);
            }
        }
    }
    static getFileExtension(filename) {
        return path_1.default.extname(filename).toLowerCase();
    }
    static isImageFile(filename) {
        const ext = this.getFileExtension(filename);
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    }
    static isPdfFile(filename) {
        const ext = this.getFileExtension(filename);
        return ext === '.pdf';
    }
    static async getFileSize(filePath) {
        const stats = await fs_1.default.promises.stat(filePath);
        return stats.size;
    }
    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}
exports.FileUtils = FileUtils;
