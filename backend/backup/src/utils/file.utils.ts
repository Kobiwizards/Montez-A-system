import fs from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'
import crypto from 'crypto'

export class FileUtils {
  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }

  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  static async getFileStats(filePath: string): Promise<any | null> {
    try {
      return await fs.stat(filePath)
    } catch {
      return null
    }
  }

  static async readFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath)
  }

  static async writeFile(filePath: string, data: Buffer | string): Promise<void> {
    await this.ensureDirectory(path.dirname(filePath))
    await fs.writeFile(filePath, data)
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath)
      return true
    } catch {
      return false
    }
  }

  static async listFiles(dirPath: string, pattern?: RegExp): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath)
      return pattern ? files.filter(file => pattern.test(file)) : files
    } catch {
      return []
    }
  }

  static async getFileSize(filePath: string): Promise<number> {
    const stats = await this.getFileStats(filePath)
    return stats?.size || 0
  }

  static async getFileExtension(filename: string): Promise<string> {
    return path.extname(filename).toLowerCase()
  }

  static async getMimeType(filePath: string): Promise<string> {
    const ext = await this.getFileExtension(filePath)
    
    const mimeTypes: Record<string, string> = {
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
    }
    
    return mimeTypes[ext] || 'application/octet-stream'
  }

  static async generateUniqueFilename(
    originalName: string,
    prefix: string = ''
  ): Promise<string> {
    const ext = await this.getFileExtension(originalName)
    const timestamp = Date.now()
    const random = crypto.randomBytes(4).toString('hex')
    const safeName = originalName.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_')
    
    return `${prefix}${safeName}_${timestamp}_${random}${ext}`
  }

  static async calculateFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    const fileBuffer = await this.readFile(filePath)
    const hash = crypto.createHash(algorithm)
    hash.update(fileBuffer)
    return hash.digest('hex')
  }

  static async bufferToStream(buffer: Buffer): Promise<Readable> {
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    return stream
  }

  static async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }

  static async copyFile(source: string, destination: string): Promise<void> {
    await this.ensureDirectory(path.dirname(destination))
    await fs.copyFile(source, destination)
  }

  static async moveFile(source: string, destination: string): Promise<void> {
    await this.ensureDirectory(path.dirname(destination))
    await fs.rename(source, destination)
  }

  static async compressImage(
    sourcePath: string,
    destinationPath: string,
  ): Promise<boolean> {
    // This is a placeholder for image compression
    // In production, you would use sharp or jimp to compress images
    try {
      // For now, just copy the file
      await this.copyFile(sourcePath, destinationPath)
      return true
    } catch (error) {
      console.error('Image compression error:', error)
      return false
    }
  }

  static async isImage(filePath: string): Promise<boolean> {
    const mimeType = await this.getMimeType(filePath)
    return mimeType.startsWith('image/')
  }

  static async isPDF(filePath: string): Promise<boolean> {
    const mimeType = await this.getMimeType(filePath)
    return mimeType === 'application/pdf'
  }

  static async getFileInfo(filePath: string): Promise<{
    name: string
    path: string
    size: number
    mimeType: string
    extension: string
    modified: Date
    created: Date
  }> {
    const stats = await this.getFileStats(filePath)
    if (!stats) {
      throw new Error('File not found')
    }

    const mimeType = await this.getMimeType(filePath)
    const extension = await this.getFileExtension(filePath)

    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      mimeType,
      extension,
      modified: stats.mtime,
      created: stats.birthtime,
    }
  }

  static async cleanupDirectory(
    dirPath: string,
    maxAgeDays: number = 30,
    maxSizeMB: number = 100
  ): Promise<{ deleted: number; freedSpace: number }> {
    const files = await this.listFiles(dirPath)
    const now = Date.now()
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    let deleted = 0
    let freedSpace = 0
    let totalSize = 0

    // Calculate total size first
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = await this.getFileStats(filePath)
      if (stats) {
        totalSize += stats.size
      }
    }

    // Delete old files if directory is too large
    if (totalSize > maxSizeBytes) {
      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = await this.getFileStats(filePath)
        
        if (stats) {
          const fileAge = now - stats.mtime.getTime()
          
          if (fileAge > maxAgeMs) {
            await this.deleteFile(filePath)
            deleted++
            freedSpace += stats.size
          }
        }
      }
    }

    return { deleted, freedSpace }
  }

  static async createBackup(
    sourcePath: string,
    backupDir: string,
    prefix: string = 'backup_'
  ): Promise<string> {
    await this.ensureDirectory(backupDir)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `${prefix}${timestamp}${await this.getFileExtension(sourcePath)}`
    const backupPath = path.join(backupDir, backupName)
    
    await this.copyFile(sourcePath, backupPath)
    return backupPath
  }

  static async zipFiles(
    files: Array<{ path: string; name: string }>,
    outputPath: string
  ): Promise<void> {
    // This is a placeholder for zip functionality
    // In production, you would use archiver or adm-zip
    console.log('Would zip files:', files, 'to:', outputPath)
  }

  static async extractZip(
    zipPath: string,
    outputDir: string
  ): Promise<string[]> {
    // This is a placeholder for unzip functionality
    // In production, you would use adm-zip or extract-zip
    console.log('Would extract zip:', zipPath, 'to:', outputDir)
    return []
  }

  static async rotateLogs(
    logDir: string,
    maxFiles: number = 10,
    maxSizeMB: number = 10
  ): Promise<void> {
    const files = await this.listFiles(logDir)
    const logFiles = files.filter(f => f.endsWith('.log')).sort()

    // Check if we need to rotate
    let totalSize = 0
    for (const file of logFiles) {
      const filePath = path.join(logDir, file)
      const size = await this.getFileSize(filePath)
      totalSize += size
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    
    if (totalSize > maxSizeBytes || logFiles.length > maxFiles) {
      // Delete oldest files
      const filesToDelete = logFiles.slice(0, logFiles.length - maxFiles + 1)
      
      for (const file of filesToDelete) {
        const filePath = path.join(logDir, file)
        await this.deleteFile(filePath)
      }
    }
  }
}
