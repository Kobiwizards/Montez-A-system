import * as fs from 'fs/promises'
import * as path from 'path'
import { config } from '../config'
import multer from 'multer'

export class FileService {
  private upload: multer.Multer

  constructor() {
    const storage = multer.memoryStorage()
    this.upload = multer({ 
      storage,
      limits: {
        fileSize: config.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        if (config.allowedFileTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error(`Invalid file type. Allowed types: ${config.allowedFileTypes.join(', ')}`))
        }
      }
    })
  }

  getMulterConfig() {
    return this.upload
  }

  async saveFile(file: Express.Multer.File, subfolder: string = ''): Promise<string> {
    const uploadDir = path.join(config.uploadPath, subfolder)
    
    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true })
    
    // Generate unique filename
    const fileExt = path.extname(file.originalname)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`
    const filePath = path.join(uploadDir, fileName)
    
    // Save file - FIX: Use file.buffer directly
    await fs.writeFile(filePath, file.buffer)
    
    return path.join(subfolder, fileName)
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(config.uploadPath, filePath)
    
    try {
      await fs.unlink(fullPath)
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath)
    return stats.size
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      return await fs.readdir(directory)
    } catch (error) {
      console.error('Failed to list files:', error)
      return []
    }
  }

  async cleanupOldFiles(directory: string, daysOld: number = 30): Promise<void> {
    try {
      const files = await this.listFiles(directory)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      for (const file of files) {
        const filePath = path.join(directory, file)
        const stats = await fs.stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await this.deleteFile(filePath)
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old files:', error)
    }
  }
}