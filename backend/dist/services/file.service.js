"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
class FileService {
    uploadDir = process.env.UPLOAD_DIR || './uploads';
    receiptDir = process.env.RECEIPT_DIR || './receipts';
    constructor() {
        this.ensureDirectoriesExist();
    }
    ensureDirectoriesExist() {
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.receiptDir)) {
            fs_1.default.mkdirSync(this.receiptDir, { recursive: true });
        }
    }
    storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, this.uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
    fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    };
    getMulterConfig() {
        return (0, multer_1.default)({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
            }
        });
    }
    async saveFile(file, subdirectory) {
        const dir = path_1.default.join(this.uploadDir, subdirectory);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        const filePath = path_1.default.join(dir, uniqueName);
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        return filePath;
    }
    async saveReceipt(fileBuffer, filename) {
        const filePath = path_1.default.join(this.receiptDir, filename);
        await fs_1.default.promises.writeFile(filePath, fileBuffer);
        return filePath;
    }
    async deleteFile(filePath) {
        if (fs_1.default.existsSync(filePath)) {
            await fs_1.default.promises.unlink(filePath);
        }
    }
    async cleanupOldFiles(daysOld = 30) {
        const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        const cleanupDirectory = async (dir) => {
            try {
                const files = await fs_1.default.promises.readdir(dir);
                for (const file of files) {
                    const filePath = path_1.default.join(dir, file);
                    const stats = await fs_1.default.promises.stat(filePath);
                    if (stats.isFile() && stats.mtimeMs < cutoff) {
                        await fs_1.default.promises.unlink(filePath);
                    }
                }
            }
            catch (error) {
                console.error(`Error cleaning up directory ${dir}:`, error);
            }
        };
        await cleanupDirectory(this.uploadDir);
        await cleanupDirectory(this.receiptDir);
    }
}
exports.FileService = FileService;
