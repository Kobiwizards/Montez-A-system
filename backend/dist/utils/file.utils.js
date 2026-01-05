"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUtils = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const crypto_1 = __importDefault(require("crypto"));
class FileUtils {
    static async ensureDirectory(dirPath) {
        try {
            await promises_1.default.access(dirPath);
        }
        catch {
            await promises_1.default.mkdir(dirPath, { recursive: true });
        }
    }
    static async fileExists(filePath) {
        try {
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    static async getFileStats(filePath) {
        try {
            return await promises_1.default.stat(filePath);
        }
        catch {
            return null;
        }
    }
    static async readFile(filePath) {
        return await promises_1.default.readFile(filePath);
    }
    static async writeFile(filePath, data) {
        await this.ensureDirectory(path_1.default.dirname(filePath));
        await promises_1.default.writeFile(filePath, data);
    }
    static async deleteFile(filePath) {
        try {
            await promises_1.default.unlink(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    static async listFiles(dirPath, pattern) {
        try {
            const files = await promises_1.default.readdir(dirPath);
            return pattern ? files.filter(file => pattern.test(file)) : files;
        }
        catch {
            return [];
        }
    }
    static async getFileSize(filePath) {
        const stats = await this.getFileStats(filePath);
        return stats?.size || 0;
    }
    static async getFileExtension(filename) {
        return path_1.default.extname(filename).toLowerCase();
    }
    static async getMimeType(filePath) {
        const ext = await this.getFileExtension(filePath);
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.json': 'application/json',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
    static async generateUniqueFilename(originalName, prefix = '') {
        const ext = await this.getFileExtension(originalName);
        const timestamp = Date.now();
        const random = crypto_1.default.randomBytes(4).toString('hex');
        const safeName = originalName.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
        return `${prefix}${safeName}_${timestamp}_${random}${ext}`;
    }
    static async calculateFileHash(filePath, algorithm = 'sha256') {
        const fileBuffer = await this.readFile(filePath);
        const hash = crypto_1.default.createHash(algorithm);
        hash.update(fileBuffer);
        return hash.digest('hex');
    }
    static async bufferToStream(buffer) {
        const stream = new stream_1.Readable();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }
    static async streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
    static async copyFile(source, destination) {
        await this.ensureDirectory(path_1.default.dirname(destination));
        await promises_1.default.copyFile(source, destination);
    }
    static async moveFile(source, destination) {
        await this.ensureDirectory(path_1.default.dirname(destination));
        await promises_1.default.rename(source, destination);
    }
    static async compressImage(sourcePath, destinationPath) {
        // This is a placeholder for image compression
        // In production, you would use sharp or jimp to compress images
        try {
            // For now, just copy the file
            await this.copyFile(sourcePath, destinationPath);
            return true;
        }
        catch (error) {
            console.error('Image compression error:', error);
            return false;
        }
    }
    static async isImage(filePath) {
        const mimeType = await this.getMimeType(filePath);
        return mimeType.startsWith('image/');
    }
    static async isPDF(filePath) {
        const mimeType = await this.getMimeType(filePath);
        return mimeType === 'application/pdf';
    }
    static async getFileInfo(filePath) {
        const stats = await this.getFileStats(filePath);
        if (!stats) {
            throw new Error('File not found');
        }
        const mimeType = await this.getMimeType(filePath);
        const extension = await this.getFileExtension(filePath);
        return {
            name: path_1.default.basename(filePath),
            path: filePath,
            size: stats.size,
            mimeType,
            extension,
            modified: stats.mtime,
            created: stats.birthtime,
        };
    }
    static async cleanupDirectory(dirPath, maxAgeDays = 30, maxSizeMB = 100) {
        const files = await this.listFiles(dirPath);
        const now = Date.now();
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        let deleted = 0;
        let freedSpace = 0;
        let totalSize = 0;
        // Calculate total size first
        for (const file of files) {
            const filePath = path_1.default.join(dirPath, file);
            const stats = await this.getFileStats(filePath);
            if (stats) {
                totalSize += stats.size;
            }
        }
        // Delete old files if directory is too large
        if (totalSize > maxSizeBytes) {
            for (const file of files) {
                const filePath = path_1.default.join(dirPath, file);
                const stats = await this.getFileStats(filePath);
                if (stats) {
                    const fileAge = now - stats.mtime.getTime();
                    if (fileAge > maxAgeMs) {
                        await this.deleteFile(filePath);
                        deleted++;
                        freedSpace += stats.size;
                    }
                }
            }
        }
        return { deleted, freedSpace };
    }
    static async createBackup(sourcePath, backupDir, prefix = 'backup_') {
        await this.ensureDirectory(backupDir);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `${prefix}${timestamp}${await this.getFileExtension(sourcePath)}`;
        const backupPath = path_1.default.join(backupDir, backupName);
        await this.copyFile(sourcePath, backupPath);
        return backupPath;
    }
    static async zipFiles(files, outputPath) {
        // This is a placeholder for zip functionality
        // In production, you would use archiver or adm-zip
        console.log('Would zip files:', files, 'to:', outputPath);
    }
    static async extractZip(zipPath, outputDir) {
        // This is a placeholder for unzip functionality
        // In production, you would use adm-zip or extract-zip
        console.log('Would extract zip:', zipPath, 'to:', outputDir);
        return [];
    }
    static async rotateLogs(logDir, maxFiles = 10, maxSizeMB = 10) {
        const files = await this.listFiles(logDir);
        const logFiles = files.filter(f => f.endsWith('.log')).sort();
        // Check if we need to rotate
        let totalSize = 0;
        for (const file of logFiles) {
            const filePath = path_1.default.join(logDir, file);
            const size = await this.getFileSize(filePath);
            totalSize += size;
        }
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (totalSize > maxSizeBytes || logFiles.length > maxFiles) {
            // Delete oldest files
            const filesToDelete = logFiles.slice(0, logFiles.length - maxFiles + 1);
            for (const file of filesToDelete) {
                const filePath = path_1.default.join(logDir, file);
                await this.deleteFile(filePath);
            }
        }
    }
}
exports.FileUtils = FileUtils;
