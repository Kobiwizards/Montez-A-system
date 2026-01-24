import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

// Simple interface for file
interface UploadedFile {
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
  private uploadDir = process.env.UPLOAD_DIR || './uploads'
  private receiptDir = process.env.RECEIPT_DIR || './receipts'

  constructor() {
    this.ensureDirectoriesExist()
  }

  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
    if (!fs.existsSync(this.receiptDir)) {
      fs.mkdirSync(this.receiptDir, { recursive: true })
    }
  }

  private storage = multer.diskStorage({
    destination: (req: any, file: UploadedFile, cb: (error: Error | null, destination: string) => void) => {
      cb(null, this.uploadDir)
    },
    filename: (req: any, file: UploadedFile, cb: (error: Error | null, filename: string) => void) => {
      const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
      cb(null, uniqueName)
    }
  })

  private fileFilter = (req: any, file: UploadedFile, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only images and PDFs are allowed'))
    }
  }

  public getMulterConfig() {
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
      }
    })
  }

  public async saveFile(file: UploadedFile, subdirectory: string): Promise<string> {
    const dir = path.join(this.uploadDir, subdirectory)
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
    const filePath = path.join(dir, uniqueName)
    
    await fs.promises.writeFile(filePath, file.buffer)
    return filePath
  }

  public async saveReceipt(fileBuffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.receiptDir, filename)
    await fs.promises.writeFile(filePath, fileBuffer)
    return filePath
  }

  public async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  }

  public async cleanupOldFiles(daysOld: number = 30): Promise<void> {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    
    const cleanupDirectory = async (dir: string) => {
      try {
        const files = await fs.promises.readdir(dir)
        
        for (const file of files) {
          const filePath = path.join(dir, file)
          const stats = await fs.promises.stat(filePath)
          
          if (stats.isFile() && stats.mtimeMs < cutoff) {
            await fs.promises.unlink(filePath)
          }
        }
      } catch (error) {
        console.error(`Error cleaning up directory ${dir}:`, error)
      }
    }

    await cleanupDirectory(this.uploadDir)
    await cleanupDirectory(this.receiptDir)
  }
}