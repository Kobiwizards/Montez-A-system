import { generateReceipt, generateWaterBill, generateReport } from './pdf-generator'

/**
 * Download file from blob
 * RENAMED from downloadFile to avoid conflict
 */
export async function downloadFileFromBlob(blob: Blob, filename: string) {
  if (!blob) return

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Download PDF receipt
 */
export async function downloadReceipt(data: any) {
  try {
    const blob = await generateReceipt(data)
    if (blob) {
      const filename = `receipt-${data.receiptNumber || Date.now()}.pdf`
      await downloadFileFromBlob(blob, filename)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to generate receipt:', error)
    return false
  }
}

/**
 * Download water bill
 */
export async function downloadWaterBill(data: any) {
  try {
    const blob = await generateWaterBill(data)
    if (blob) {
      const filename = `water-bill-${data.month || Date.now()}.pdf`
      await downloadFileFromBlob(blob, filename)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to generate water bill:', error)
    return false
  }
}

/**
 * Download report
 */
export async function downloadReport(data: any, type: string) {
  try {
    const blob = await generateReport(data, type)
    if (blob) {
      const filename = `report-${type}-${Date.now()}.pdf`
      await downloadFileFromBlob(blob, filename)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to generate report:', error)
    return false
  }
}

/**
 * Download CSV data
 */
export function downloadCSV(data: any[], filename: string) {
  if (!data.length) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ]

  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv' })
  downloadFileFromBlob(blob, filename)
}

/**
 * Download JSON data
 */
export function downloadJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  downloadFileFromBlob(blob, filename)
}

/**
 * Download image
 */
export function downloadImage(url: string, filename: string) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => downloadFileFromBlob(blob, filename))
    .catch(error => console.error('Failed to download image:', error))
}