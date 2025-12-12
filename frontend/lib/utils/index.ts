import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }

  return d.toLocaleDateString('en-US', options)
}

export function generateReceiptNumber(prefix: string = 'MTA'): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  return `${prefix}-${year}${month}${day}-${random}`
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  const re = /^(\+254|0)[17]\d{8}$/
  return re.test(phone)
}

export function calculateWaterBill(units: number, rate: number = 150): number {
  return units * rate
}

export function generateApartmentOptions(): Array<{ value: string; label: string; rent: number }> {
  return [
    { value: '1A1', label: '1A1 - Two Bedroom', rent: 18000 },
    { value: '1A2', label: '1A2 - Two Bedroom', rent: 18000 },
    { value: '1B1', label: '1B1 - One Bedroom', rent: 15000 },
    { value: '1B2', label: '1B2 - One Bedroom', rent: 15000 },
    { value: '2A1', label: '2A1 - Two Bedroom', rent: 18000 },
    { value: '2A2', label: '2A2 - Two Bedroom', rent: 18000 },
    { value: '2B1', label: '2B1 - One Bedroom', rent: 15000 },
    { value: '2B2', label: '2B2 - One Bedroom', rent: 15000 },
    { value: '3A1', label: '3A1 - Two Bedroom', rent: 18000 },
    { value: '3A2', label: '3A2 - Two Bedroom', rent: 18000 },
    { value: '3B1', label: '3B1 - One Bedroom', rent: 15000 },
    { value: '3B2', label: '3B2 - One Bedroom', rent: 15000 },
    { value: '4A1', label: '4A1 - Two Bedroom', rent: 18000 },
    { value: '4A2', label: '4A2 - Two Bedroom', rent: 18000 },
    { value: '4B1', label: '4B1 - One Bedroom', rent: 15000 },
    { value: '4B2', label: '4B2 - One Bedroom', rent: 15000 },
    { value: '5A1', label: '5A1 - Two Bedroom', rent: 18000 },
    { value: '5A2', label: '5A2 - Two Bedroom', rent: 18000 },
    { value: '5B1', label: '5B1 - One Bedroom', rent: 15000 },
    { value: '5B2', label: '5B2 - One Bedroom', rent: 15000 },
    { value: '6A1', label: '6A1 - Two Bedroom (Rooftop)', rent: 18000 },
    { value: '6A2', label: '6A2 - Two Bedroom (Rooftop)', rent: 18000 },
  ]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Export from sub-modules - FIX THE CONFLICT BY RENAMING
export * from './date-formatters'
export * from './currency-formatters'

// Don't use wildcard export for conflicting modules, export specific functions
export {
  getFileExtension,
  getFileNameWithoutExtension,
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  createFilePreview,
  revokeFilePreview,
  base64ToBlob,
  readFileAsBase64,
  generateUniqueFilename,
  compressImage,
  isImageFile,
  isPdfFile,
  getFileIcon,
  // Rename the conflicting function
  downloadFile as downloadFileFromURL,
} from './file-utils'

export * from './validation-utils'

// FIX: Instead of wildcard export, export specific functions from pdf-generator to avoid circular dependency
export {
  generateReceipt,
  generateWaterBill,
  generateReport
} from './pdf-generator'
export type { ReceiptData } from './pdf-generator'

// Export download-utils without the conflicting function
export {
  downloadFileFromBlob,
  downloadReceipt,
  downloadWaterBill,
  downloadReport,
  downloadCSV,
  downloadJSON,
  downloadImage,
} from './download-utils'