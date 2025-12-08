import multer from 'multer'
import path from 'path'
import { Request } from 'express'
import { config } from '../config/index'

export class FileService {
  private storage: multer.StorageEngine

  constructor() {
    this.storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, config.uploadPath)
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
      },
    })
  }

  getMulterConfig() {
    const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
      ]

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Invalid file type. Only images and PDFs are allowed.'))
      }
    }

    return multer({
      storage: this.storage,
      limits: {
        fileSize: config.maxFileSize,
      },
      fileFilter,
    })
  }

  async compressImage(filePath: string, _quality: number = 80): Promise<string> {
    // Placeholder for image compression
    // In production, use sharp or jimp
    return filePath
  }
}
