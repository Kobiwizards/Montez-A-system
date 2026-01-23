import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export class FileUtils {
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
      }
    }

    return { valid: true }
  }

  static generateUniqueFilename(originalname: string): string {
    const ext = path.extname(originalname)
    const basename = path.basename(originalname, ext)
    const timestamp = Date.now()
    const uniqueId = uuidv4().slice(0, 8)
    return `${basename}-${timestamp}-${uniqueId}${ext}`
  }

  static async saveFile(file: Express.Multer.File, destination: string): Promise<string> {
    const filename = this.generateUniqueFilename(file.originalname)
    const filePath = path.join(destination, filename)

    // Ensure directory exists
    await fs.promises.mkdir(destination, { recursive: true })

    // Move file
    await fs.promises.writeFile(filePath, file.buffer)

    return filename
  }

  static async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  }

  static async cleanupDirectory(directory: string, maxAgeDays: number = 30): Promise<void> {
    if (!fs.existsSync(directory)) return

    const files = await fs.promises.readdir(directory)
    const cutoff = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = await fs.promises.stat(filePath)

      if (stats.isFile() && stats.mtimeMs < cutoff) {
        await fs.promises.unlink(filePath)
      }
    }
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase()
  }

  static isImageFile(filename: string): boolean {
    const ext = this.getFileExtension(filename)
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)
  }

  static isPdfFile(filename: string): boolean {
    const ext = this.getFileExtension(filename)
    return ext === '.pdf'
  }

  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.promises.stat(filePath)
    return stats.size
  }

  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }
}