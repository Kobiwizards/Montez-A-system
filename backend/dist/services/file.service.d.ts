import multer from 'multer';
export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export declare class FileService {
    private upload;
    constructor();
    getMulterConfig(): multer.Multer;
    saveFile(file: UploadedFile, userId: string, type: 'payments' | 'maintenance'): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    getFile(filePath: string): Promise<Buffer>;
    fileExists(filePath: string): Promise<boolean>;
    validateFile(file: UploadedFile, options?: {
        maxSize?: number;
        allowedTypes?: string[];
    }): Promise<{
        valid: boolean;
        error?: string;
    }>;
    cleanupOldFiles(daysOld?: number): Promise<number>;
}
//# sourceMappingURL=file.service.d.ts.map