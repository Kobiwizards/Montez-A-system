import { config } from '../config/index'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'

export interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

export class FileService {
  private upload: multer.Multer

  constructor() {
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('Invalid file type'))
        }
      },
    })
  }

  getMulterConfig() {
    return this.upload
  }

  async saveFile(
    file: UploadedFile,
    userId: string,
    type: 'payments' | 'maintenance'
  ): Promise<string> {
    // Create directory if it doesn't exist
    const userDir = path.join(config.uploadPath, userId, type)
    await fs.mkdir(userDir, { recursive: true })

    // Generate unique filename
    const fileExt = path.extname(file.originalname)
    const fileName = `${uuidv4()}${fileExt}`
    const filePath = path.join(userDir, fileName)

    // Save file
    await fs.writeFile(filePath, file.buffer)

    // Return relative path for storage in database
    return path.join(userId, type, fileName)
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(config.uploadPath, filePath)
      await fs.unlink(fullPath)
    } catch (error) {
      console.warn('Failed to delete file:', error)
      // Don't throw error for file deletion failures
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(config.uploadPath, filePath)
    return fs.readFile(fullPath)
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(config.uploadPath, filePath)
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  async validateFile(
    file: UploadedFile,
    options: {
      maxSize?: number
      allowedTypes?: string[]
    } = {}
  ): Promise<{ valid: boolean; error?: string }> {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'] } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      }
    }

    return { valid: true }
  }

  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      // This is a simplified implementation
      // In production, you might want to track file creation dates in the database
      console.log(`File cleanup for files older than ${daysOld} days would run here`)
      return 0
    } catch (error) {
      console.error('File cleanup error:', error)
      return 0
    }
  }
}
