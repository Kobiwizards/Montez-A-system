import * as fs from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';
import { createHash } from 'crypto';
import { Stats } from 'fs';

/**
 * Save uploaded file to disk
 */
export async function saveFileToDisk(
  file: Express.Multer.File,
  directory: string
): Promise<string> {
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
export async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

/**
 * Calculate file hash
 */
export async function calculateFileHash(
  filePath: string,
  algorithm: string = 'sha256'
): Promise<string> {
  const fileBuffer = await readFileAsBuffer(filePath);
  const hash = createHash(algorithm);
  
  hash.update(fileBuffer);
  return hash.digest('hex');
}

/**
 * Convert stream to Buffer
 */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Convert Buffer to file
 */
export async function bufferToFile(buffer: Buffer, filePath: string): Promise<void> {
  await fs.writeFile(filePath, buffer);
}

/**
 * Get file statistics
 */
export async function getFileStats(filePath: string): Promise<Stats> {
  return await fs.stat(filePath);
}

/**
 * Validate file type
 */
export function validateFileType(
  file: Express.Multer.File,
  allowedMimeTypes: string[]
): boolean {
  return allowedMimeTypes.includes(file.mimetype);
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: Express.Multer.File,
  maxSizeInBytes: number
): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
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
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
  }
}

/**
 * Create directory if it doesn't exist
 */
export async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
}

/**
 * Get file extension from mimetype
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
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
export async function compressImage(
  filePath: string,
  quality: number = 80
): Promise<string> {
  // In production, use sharp library for image compression
  // For now, return original path
  return filePath;
}

/**
 * Extract text from image (placeholder for OCR)
 */
export async function extractTextFromImage(
  filePath: string
): Promise<string | null> {
  // In production, implement OCR with Tesseract.js
  return null;
}

/**
 * Validate and process uploaded files
 */
export async function processUploadedFiles(
  files: Express.Multer.File[],
  uploadDir: string,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    compressImages?: boolean;
  } = {}
): Promise<{
  success: boolean;
  files: string[];
  errors: string[];
}> {
  const result = {
    success: true,
    files: [] as string[],
    errors: [] as string[],
  };
  
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    compressImages = false,
  } = options;
  
  // Ensure upload directory exists
  await ensureDirectoryExists(uploadDir);
  
  for (const file of files) {
    try {
      // Validate file type
      if (!validateFileType(file, allowedTypes)) {
        result.errors.push(
          `File ${file.originalname}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`
        );
        result.success = false;
        continue;
      }
      
      // Validate file size
      if (!validateFileSize(file, maxSize)) {
        result.errors.push(
          `File ${file.originalname}: File too large. Max size: ${maxSize / (1024 * 1024)}MB`
        );
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
    } catch (error) {
      result.errors.push(`File ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }
  }
  
  return result;
}