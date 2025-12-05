import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { config } from '../config'
import { Request } from 'express'

export interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  filename: string
  path: string
  buffer: Buffer
}

export class FileService {
  private uploadDir: string
  private receiptsDir: string

  constructor() {
    this.uploadDir = config.uploadPath
    this.receiptsDir = config.receiptsPath
    
    // Create directories if they don't exist
    this.ensureDirectories()
  }

  private async ensureDirectories() {
    await fs.mkdir(this.uploadDir, { recursive: true })
    await fs.mkdir(this.receiptsDir, { recursive: true })
  }

  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const tenantId = (req as any).user?.id || 'anonymous'
        const tenantDir = path.join(this.uploadDir, tenantId)
        
        // Create tenant directory if it doesn't exist
        fs.mkdir(tenantDir, { recursive: true })
          .then(() => cb(null, tenantDir))
          .catch(err => cb(err, tenantDir))
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
      },
    })

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
      ]

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'))
      }
    }

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.maxFileSize, // 5MB
        files: 5, // Max 5 files per upload
      },
    })
  }

  async savePaymentScreenshot(file: Express.Multer.File, tenantId: string): Promise<string> {
    const tenantDir = path.join(this.uploadDir, tenantId)
    await fs.mkdir(tenantDir, { recursive: true })

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const filename = `payment-${uniqueSuffix}${ext}`
    const filePath = path.join(tenantDir, filename)

    await fs.writeFile(filePath, file.buffer)

    // Return relative path for database storage
    return path.join(tenantId, filename)
  }

  async saveReceipt(fileBuffer: Buffer, receiptNumber: string): Promise<string> {
    const filename = `${receiptNumber}.pdf`
    const filePath = path.join(this.receiptsDir, filename)

    await fs.writeFile(filePath, fileBuffer)

    return filename
  }

  async getFile(filePath: string): Promise<Buffer> {
    const absolutePath = path.join(this.uploadDir, filePath)
    return await fs.readFile(absolutePath)
  }

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.join(this.uploadDir, filePath)
    
    try {
      await fs.unlink(absolutePath)
    } catch (error) {
      console.warn('Failed to delete file:', error)
    }
  }

  async deleteReceiptFile(filePath: string): Promise<void> {
    const absolutePath = path.join(this.receiptsDir, filePath)
    
    try {
      await fs.unlink(absolutePath)
    } catch (error) {
      console.warn('Failed to delete receipt file:', error)
    }
  }

  async cleanupOldFiles(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    try {
      // Get all files in upload directory
      const files = await this.getAllFiles(this.uploadDir)
      
      for (const file of files) {
        const stats = await fs.stat(file)
        if (stats.mtime < cutoffDate) {
          await fs.unlink(file)
          console.log('Deleted old file:', file)
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error)
    }
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = []
    
    const items = await fs.readdir(dir, { withFileTypes: true })
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      
      if (item.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath)
        files.push(...subFiles)
      } else {
        files.push(fullPath)
      }
    }
    
    return files
  }

  async getFileInfo(filePath: string): Promise<{
    path: string
    size: number
    mtime: Date
    mimetype: string
  }> {
    const absolutePath = path.join(this.uploadDir, filePath)
    const stats = await fs.stat(absolutePath)
    
    // Determine MIME type from extension
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
    }

    return {
      path: filePath,
      size: stats.size,
      mtime: stats.mtime,
      mimetype: mimeTypes[ext] || 'application/octet-stream',
    }
  }

  async compressImage(filePath: string, quality: number = 80): Promise<string> {
    // This is a placeholder for image compression logic
    // In a real implementation, you might use sharp or jimp
    console.log('Image compression would happen here for:', filePath)
    return filePath
  }

  async validateFile(file: Express.Multer.File): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    const maxSize = config.maxFileSize

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`)
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ]

    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only images and PDFs are allowed.')
    }

    // Check file name (prevent path traversal)
    const filename = file.originalname
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      errors.push('Invalid file name')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}