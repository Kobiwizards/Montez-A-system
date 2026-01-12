import * as fs from 'fs/promises'
import * as path from 'path'
import { Readable } from 'stream'
import { createHash } from 'crypto'

// Remove all Buffer.from() calls and use the buffers directly:
export async function saveFileToDisk(file: Express.Multer.File, directory: string): Promise<string> {
  await fs.mkdir(directory, { recursive: true })
  
  const fileName = `${Date.now()}-${file.originalname}`
  const filePath = path.join(directory, fileName)
  
  // FIX: Use file.buffer directly
  await fs.writeFile(filePath, file.buffer)
  
  return filePath
}

export async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  // FIX: Return directly without Buffer.from()
  return await fs.readFile(filePath)
}

export async function calculateFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
  const fileBuffer = await readFileAsBuffer(filePath)
  const hash = createHash(algorithm)
  
  // FIX: Use fileBuffer directly
  hash.update(fileBuffer)
  
  return hash.digest('hex')
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [] // Change to Buffer[]
    
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export async function bufferToFile(buffer: Buffer, filePath: string): Promise<void> {
  // FIX: Use buffer directly
  await fs.writeFile(filePath, buffer)
}

// Fix the getFileStats return type:
export async function getFileStats(filePath: string): Promise<fs.Stats> {
  return await fs.stat(filePath)
}