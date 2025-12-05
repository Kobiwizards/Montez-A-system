/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Get file name without extension
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file type
 */
export const isValidFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 */
export const isValidFileSize = (
  file: File,
  maxSize: number
): boolean => {
  return file.size <= maxSize
}

/**
 * Create object URL for file preview
 */
export const createFilePreview = (file: File): string => {
  return URL.createObjectURL(file)
}

/**
 * Revoke object URL to prevent memory leaks
 */
export const revokeFilePreview = (url: string): void => {
  URL.revokeObjectURL(url)
}

/**
 * Download file from URL
 */
export const downloadFile = (
  url: string,
  filename: string
): void => {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Convert base64 to blob
 */
export const base64ToBlob = (
  base64: string,
  contentType: string = ''
): Blob => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

/**
 * Read file as base64
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (
  originalName: string,
  prefix?: string
): string => {
  const ext = getFileExtension(originalName)
  const name = getFileNameWithoutExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  
  let newName = `${name}-${timestamp}-${random}.${ext}`
  
  if (prefix) {
    newName = `${prefix}-${newName}`
  }
  
  return newName
}

/**
 * Compress image (placeholder for actual implementation)
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  // This is a placeholder implementation
  // In production, you would use a library like canvas-compressor
  return file
}

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

/**
 * Check if file is a PDF
 */
export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf'
}

/**
 * Get file icon based on type
 */
export const getFileIcon = (filename: string): string => {
  const ext = getFileExtension(filename).toLowerCase()
  
  switch (ext) {
    case 'pdf':
      return '📄'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️'
    case 'doc':
    case 'docx':
      return '📝'
    case 'xls':
    case 'xlsx':
      return '📊'
    case 'zip':
    case 'rar':
      return '📦'
    default:
      return '📎'
  }
}