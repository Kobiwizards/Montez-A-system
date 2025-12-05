import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ReceiptData {
  receiptNumber: string
  date: string
  tenantName: string
  apartment: string
  unitType: string
  month: string
  items: {
    description: string
    amount: number
  }[]
  subtotal: number
  tax?: number
  total: number
  previousBalance: number
  amountPaid: number
  newBalance: number
  paymentMethod: string
  transactionCode?: string
  caretakerName?: string
  verifiedBy: string
  notes?: string
}

/**
 * Generate receipt PDF
 */
export const generateReceiptPDF = (data: ReceiptData): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Add header
  doc.setFontSize(20)
  doc.setTextColor(0, 51, 102) // Dark blue
  doc.text('MONTEZ A APARTMENTS', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('Kizito Road, Nairobi', pageWidth / 2, 28, { align: 'center' })
  doc.text('Property Management System', pageWidth / 2, 34, { align: 'center' })
  
  // Add receipt header
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('PAYMENT RECEIPT', pageWidth / 2, 45, { align: 'center' })
  
  // Add receipt details
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  
  const detailsY = 55
  doc.text(`Receipt No: ${data.receiptNumber}`, 20, detailsY)
  doc.text(`Date: ${data.date}`, pageWidth - 20, detailsY, { align: 'right' })
  
  doc.text(`Tenant: ${data.tenantName}`, 20, detailsY + 7)
  doc.text(`Apartment: ${data.apartment} (${data.unitType})`, 20, detailsY + 14)
  doc.text(`Period: ${data.month}`, 20, detailsY + 21)
  
  // Add table header
  const tableY = detailsY + 30
  
  // Table data
  const tableData = data.items.map(item => [
    item.description,
    `KSh ${item.amount.toLocaleString()}`
  ])
  
  // Add subtotal, tax, total
  tableData.push(['Subtotal', `KSh ${data.subtotal.toLocaleString()}`])
  
  if (data.tax) {
    tableData.push(['Tax', `KSh ${data.tax.toLocaleString()}`])
  }
  
  tableData.push(['Total', `KSh ${data.total.toLocaleString()}`])
  
  // Generate table
  (doc as any).autoTable({
    startY: tableY,
    head: [['Description', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: 255,
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 10
    },
    margin: { left: 20, right: 20 }
  })
  
  const finalY = (doc as any).lastAutoTable.finalY || tableY + 100
  
  // Add balance information
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text('Balance Information', 20, finalY + 10)
  
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(`Previous Balance: KSh ${data.previousBalance.toLocaleString()}`, 30, finalY + 20)
  doc.text(`Amount Paid: KSh ${data.amountPaid.toLocaleString()}`, 30, finalY + 27)
  doc.text(`New Balance: KSh ${data.newBalance.toLocaleString()}`, 30, finalY + 34)
  
  // Add payment details
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text('Payment Details', pageWidth / 2, finalY + 45)
  
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  const paymentY = finalY + 55
  doc.text(`Method: ${data.paymentMethod}`, 30, paymentY)
  
  if (data.transactionCode) {
    doc.text(`Transaction Code: ${data.transactionCode}`, 30, paymentY + 7)
  }
  
  if (data.caretakerName) {
    doc.text(`Caretaker: ${data.caretakerName}`, 30, paymentY + 14)
  }
  
  doc.text(`Verified By: ${data.verifiedBy}`, 30, paymentY + 21)
  
  // Add footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Thank you for your payment!', pageWidth / 2, footerY - 10, { align: 'center' })
  
  if (data.notes) {
    doc.text(`Notes: ${data.notes}`, 20, footerY - 3, { maxWidth: pageWidth - 40 })
  }
  
  doc.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, footerY, { align: 'center' })
  
  // Add watermark
  doc.setFontSize(50)
  doc.setTextColor(220, 220, 220)
  doc.text('PAID', pageWidth / 2, footerY / 2, { align: 'center' })
  
  return doc
}

/**
 * Generate financial report PDF
 */
export const generateFinancialReportPDF = (
  title: string,
  data: any[],
  summary: any
): jsPDF => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Add header
  doc.setFontSize(20)
  doc.setTextColor(0, 51, 102)
  doc.text('MONTEZ A APARTMENTS', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(title, pageWidth / 2, 35, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 42, { align: 'center' })
  
  // Add summary section
  const summaryY = 50
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Summary', 20, summaryY)
  
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  
  let currentY = summaryY + 10
  Object.entries(summary).forEach(([key, value]) => {
    if (typeof value === 'number') {
      doc.text(`${key}: KSh ${value.toLocaleString()}`, 30, currentY)
    } else {
      doc.text(`${key}: ${value}`, 30, currentY)
    }
    currentY += 7
  })
  
  // Add data table
  const tableY = currentY + 10
  
  if (data.length > 0) {
    const headers = Object.keys(data[0])
    const tableData = data.map(row => headers.map(header => row[header]))
    
    (doc as any).autoTable({
      startY: tableY,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: 255,
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      margin: { left: 20, right: 20 }
    })
  }
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10)
  }
  
  return doc
}

/**
 * Save PDF to file
 */
export const savePDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename)
}

/**
 * Open PDF in new tab
 */
export const openPDFInNewTab = (doc: jsPDF): void => {
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}