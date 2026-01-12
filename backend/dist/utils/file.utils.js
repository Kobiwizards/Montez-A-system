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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFileToDisk = saveFileToDisk;
exports.readFileAsBuffer = readFileAsBuffer;
exports.calculateFileHash = calculateFileHash;
exports.streamToBuffer = streamToBuffer;
exports.bufferToFile = bufferToFile;
exports.getFileStats = getFileStats;
exports.validateFileType = validateFileType;
exports.validateFileSize = validateFileSize;
exports.generateUniqueFilename = generateUniqueFilename;
exports.deleteFile = deleteFile;
exports.ensureDirectoryExists = ensureDirectoryExists;
exports.getExtensionFromMimeType = getExtensionFromMimeType;
exports.compressImage = compressImage;
exports.extractTextFromImage = extractTextFromImage;
exports.processUploadedFiles = processUploadedFiles;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
/**
 * Save uploaded file to disk
 */
async function saveFileToDisk(file, directory) {
    await fs.mkdir(directory, { recursive: true });
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(directory, fileName);
    // Write file buffer directly
    await fs.writeFile(filePath, file.buffer);
    return filePath;
}
/**
 * Read file as Buffer
 */
async function readFileAsBuffer(filePath) {
    return await fs.readFile(filePath);
}
/**
 * Calculate file hash
 */
async function calculateFileHash(filePath, algorithm = 'sha256') {
    const fileBuffer = await readFileAsBuffer(filePath);
    const hash = (0, crypto_1.createHash)(algorithm);
    hash.update(fileBuffer);
    return hash.digest('hex');
}
/**
 * Convert stream to Buffer
 */
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
/**
 * Convert Buffer to file
 */
async function bufferToFile(buffer, filePath) {
    await fs.writeFile(filePath, buffer);
}
/**
 * Get file statistics
 */
async function getFileStats(filePath) {
    return await fs.stat(filePath);
}
/**
 * Validate file type
 */
function validateFileType(file, allowedMimeTypes) {
    return allowedMimeTypes.includes(file.mimetype);
}
/**
 * Validate file size
 */
function validateFileSize(file, maxSizeInBytes) {
    return file.size <= maxSizeInBytes;
}
/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    return `${sanitizedName}_${timestamp}_${randomString}${extension}`;
}
/**
 * Delete file safely
 */
async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
    }
    catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
    }
}
/**
 * Create directory if it doesn't exist
 */
async function ensureDirectoryExists(directory) {
    try {
        await fs.access(directory);
    }
    catch {
        await fs.mkdir(directory, { recursive: true });
    }
}
/**
 * Get file extension from mimetype
 */
function getExtensionFromMimeType(mimeType) {
    const extensions = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    };
    return extensions[mimeType] || '.bin';
}
/**
 * Compress image (placeholder - implement with sharp in production)
 */
async function compressImage(filePath, quality = 80) {
    // In production, use sharp library for image compression
    // For now, return original path
    return filePath;
}
/**
 * Extract text from image (placeholder for OCR)
 */
async function extractTextFromImage(filePath) {
    // In production, implement OCR with Tesseract.js
    return null;
}
/**
 * Validate and process uploaded files
 */
async function processUploadedFiles(files, uploadDir, options = {}) {
    const result = {
        success: true,
        files: [],
        errors: [],
    };
    const { maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'], compressImages = false, } = options;
    // Ensure upload directory exists
    await ensureDirectoryExists(uploadDir);
    for (const file of files) {
        try {
            // Validate file type
            if (!validateFileType(file, allowedTypes)) {
                result.errors.push(`File ${file.originalname}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
                result.success = false;
                continue;
            }
            // Validate file size
            if (!validateFileSize(file, maxSize)) {
                result.errors.push(`File ${file.originalname}: File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
                result.success = false;
                continue;
            }
            // Save file
            const savedPath = await saveFileToDisk(file, uploadDir);
            // Compress image if needed
            let finalPath = savedPath;
            if (compressImages && file.mimetype.startsWith('image/')) {
                finalPath = await compressImage(savedPath);
            }
            result.files.push(finalPath);
        }
        catch (error) {
            result.errors.push(`File ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.success = false;
        }
    }
    return result;
}
