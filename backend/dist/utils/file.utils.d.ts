import { Readable } from 'stream';
export declare class FileUtils {
    static ensureDirectory(dirPath: string): Promise<void>;
    static fileExists(filePath: string): Promise<boolean>;
    static getFileStats(filePath: string): Promise<any | null>;
    static readFile(filePath: string): Promise<Buffer>;
    static writeFile(filePath: string, data: Buffer | string): Promise<void>;
    static deleteFile(filePath: string): Promise<boolean>;
    static listFiles(dirPath: string, pattern?: RegExp): Promise<string[]>;
    static getFileSize(filePath: string): Promise<number>;
    static getFileExtension(filename: string): Promise<string>;
    static getMimeType(filePath: string): Promise<string>;
    static generateUniqueFilename(originalName: string, prefix?: string): Promise<string>;
    static calculateFileHash(filePath: string, algorithm?: string): Promise<string>;
    static bufferToStream(buffer: Buffer): Promise<Readable>;
    static streamToBuffer(stream: Readable): Promise<Buffer>;
    static copyFile(source: string, destination: string): Promise<void>;
    static moveFile(source: string, destination: string): Promise<void>;
    static compressImage(sourcePath: string, destinationPath: string): Promise<boolean>;
    static isImage(filePath: string): Promise<boolean>;
    static isPDF(filePath: string): Promise<boolean>;
    static getFileInfo(filePath: string): Promise<{
        name: string;
        path: string;
        size: number;
        mimeType: string;
        extension: string;
        modified: Date;
        created: Date;
    }>;
    static cleanupDirectory(dirPath: string, maxAgeDays?: number, maxSizeMB?: number): Promise<{
        deleted: number;
        freedSpace: number;
    }>;
    static createBackup(sourcePath: string, backupDir: string, prefix?: string): Promise<string>;
    static zipFiles(files: Array<{
        path: string;
        name: string;
    }>, outputPath: string): Promise<void>;
    static extractZip(zipPath: string, outputDir: string): Promise<string[]>;
    static rotateLogs(logDir: string, maxFiles?: number, maxSizeMB?: number): Promise<void>;
}
//# sourceMappingURL=file.utils.d.ts.map