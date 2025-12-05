import { savePDF } from './pdf-generator'

/**
 * Download file from blob
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download data as JSON file
 */
export const downloadJSON = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `${filename}.json`)
}

/**
 * Download data as CSV file
 */
export const downloadCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const cell = row[header]
      return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
    }).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

/**
 * Download data as Excel file (placeholder - would use a library in production)
 */
export const downloadExcel = (data: any[], filename: string): void => {
  // In production, use a library like xlsx
  downloadCSV(data, filename) // Fallback to CSV
}

/**
 * Download receipt as PDF
 */
export const downloadReceipt = (receiptData: any): void => {
  const { generateReceiptPDF, savePDF } = require('./pdf-generator')
  const doc = generateReceiptPDF(receiptData)
  savePDF(doc, `receipt-${receiptData.receiptNumber}.pdf`)
}

/**
 * Download image from URL
 */
export const downloadImage = (url: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        downloadBlob(blob, filename)
        resolve()
      })
      .catch(reject)
  })
}

/**
 * Download multiple files as ZIP (placeholder)
 */
export const downloadAsZip = async (files: Array<{ url: string; filename: string }>): Promise<void> => {
  // In production, use a library like JSZip
  console.log('ZIP download would be implemented with JSZip')
  // For now, download each file separately
  for (const file of files) {
    await downloadImage(file.url, file.filename)
  }
}

/**
 * Format filename with timestamp
 */
export const formatFilenameWithTimestamp = (
  baseName: string,
  extension: string
): string => {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
  return `${baseName}-${dateStr}-${timeStr}.${extension}`
}

/**
 * Check if download is supported
 */
export const isDownloadSupported = (): boolean => {
  return typeof document.createElement('a').download !== 'undefined'
}

/**
 * Show download progress
 */
export const downloadWithProgress = async (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    
    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress)
      }
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response
        downloadBlob(blob, filename)
        resolve()
      } else {
        reject(new Error(`Download failed with status ${xhr.status}`))
      }
    }
    
    xhr.onerror = () => {
      reject(new Error('Download failed'))
    }
    
    xhr.send()
  })
}