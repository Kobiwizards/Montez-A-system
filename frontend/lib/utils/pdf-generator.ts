// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

export interface ReceiptData {
  receiptNumber: string
  date: string
  tenantName: string
  tenantEmail: string
  apartment: string
  amount: number
  paymentMethod: string
  paymentType: string
  month: string
  description?: string
  transactionCode?: string
  total: number
}

// SIMPLIFIED VERSION - Remove all complex logic first
export async function generateReceipt(data: ReceiptData): Promise<Blob | null> {
  if (!isBrowser) {
    console.warn('PDF generation only available in browser')
    return null
  }

  try {
    // Dynamic imports
    const { default: jsPDF } = await import('jspdf')
    // @ts-ignore - jspdf-autotable doesn't have proper types
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // SIMPLE HEADER
    doc.setFontSize(20)
    doc.text('Montez A Apartments', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('Payment Receipt', 105, 30, { align: 'center' })

    // SIMPLE CONTENT - NO COMPLEX ARRAYS
    doc.setFontSize(10)
    doc.text(`Receipt: ${data.receiptNumber}`, 20, 50)
    doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 20, 58)
    doc.text(`Tenant: ${data.tenantName}`, 20, 66)
    doc.text(`Apartment: ${data.apartment}`, 20, 74)
    doc.text(`Amount: KSh ${data.amount.toLocaleString()}`, 20, 82)
    doc.text(`Total: KSh ${data.total.toLocaleString()}`, 20, 90)

    // Generate blob
    return doc.output('blob')
  } catch (error) {
    console.error('Error generating PDF:', error)
    return null
  }
}

// SIMPLIFIED other functions
export async function generateWaterBill(data: any): Promise<Blob | null> {
  if (!isBrowser) return null
  return null // Simplified for now
}

export async function generateReport(data: any, type: string): Promise<Blob | null> {
  if (!isBrowser) return null
  return null // Simplified for now
}
