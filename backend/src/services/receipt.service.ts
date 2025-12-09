import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'
import { config } from '../config'
import { prisma } from '../lib/prisma'

export class ReceiptService {
  async generateReceipt(payment: any) {
    try {
      // Get payment with tenant details
      const paymentWithTenant = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          tenant: true,
        },
      })

      if (!paymentWithTenant) {
        throw new Error('Payment not found')
      }

      const { tenant } = paymentWithTenant

      // Generate receipt number
      const receiptNumber = `MTA-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      })

      // Create receipts directory if it doesn't exist
      const receiptsDir = config.receiptsPath
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true })
      }

      const filePath = path.join(receiptsDir, `${receiptNumber}.pdf`)
      const writeStream = fs.createWriteStream(filePath)
      doc.pipe(writeStream)

      // Add content to PDF
      this.addReceiptContent(doc, receiptNumber, paymentWithTenant, tenant)

      // End document
      doc.end()

      // Wait for write to complete
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve())
        writeStream.on('error', reject)
      })

      // Save receipt to database
      const receipt = await prisma.receipt.create({
        data: {
          paymentId: payment.id as string,
          tenantId: tenant.id as string, // ADDED: Required by schema
          receiptNumber,
          filePath: `${receiptNumber}.pdf`,
          generatedAt: new Date(),
        },
      })

      return receipt
    } catch (error) {
      console.error('Error generating receipt:', error)
      throw error
    }
  }

  private addReceiptContent(
    doc: PDFKit.PDFDocument,
    receiptNumber: string,
    payment: any,
    tenant: any
  ) {
    // Header
    doc
      .fontSize(20)
      .text(config.appName, { align: 'center' })
      .fontSize(12)
      .text('Property Management System', { align: 'center' })
      .moveDown()

    // Receipt header
    doc
      .fontSize(16)
      .text('PAYMENT RECEIPT', { align: 'center' })
      .moveDown()

    // Receipt details
    doc.fontSize(10).text(`Receipt Number: ${receiptNumber}`, { align: 'right' })
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, { align: 'right' })
    doc.moveDown()

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // Tenant Information
    doc.fontSize(12).text('TENANT INFORMATION:')
    doc.fontSize(10)
    doc.text(`Name: ${tenant.name}`)
    doc.text(`Apartment: ${tenant.apartment}`)
    doc.text(`Email: ${tenant.email}`)
    doc.text(`Phone: ${tenant.phone}`)
    doc.moveDown()

    // Payment Information
    doc.fontSize(12).text('PAYMENT INFORMATION:')
    doc.fontSize(10)
    doc.text(`Payment ID: ${payment.id.slice(-8)}`)
    doc.text(`Type: ${payment.type}`)
    doc.text(`Method: ${payment.method}`)
    doc.text(`Month: ${payment.month}`)
    doc.text(`Transaction Code: ${payment.transactionCode || 'N/A'}`)
    doc.text(`Verified By: ${payment.verifiedBy ? 'Admin' : 'N/A'}`)
    doc.text(`Verified At: ${payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleString() : 'N/A'}`)
    doc.moveDown()

    // Amount
    doc.fontSize(14).text('AMOUNT DETAILS:')
    doc.fontSize(12)
    doc.text(`Amount: KSh ${payment.amount.toLocaleString()}`, { align: 'right' })
    doc.moveDown()

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // Total
    doc
      .fontSize(16)
      .text(`TOTAL: KSh ${payment.amount.toLocaleString()}`, { align: 'right' })
      .moveDown(2)

    // Water details if applicable
    if (payment.type === 'WATER') {
      const waterUnits = Math.floor(payment.amount / config.waterRatePerUnit)
      doc.fontSize(10).text(`Water Units: ${waterUnits} units @ KSh ${config.waterRatePerUnit}/unit`)
    }

    // Rent details if applicable
    if (payment.type === 'RENT') {
      const unitType = tenant.unitType === 'ONE_BEDROOM' ? 'One Bedroom' : 'Two Bedroom'
      const expectedRent = tenant.unitType === 'ONE_BEDROOM' ? config.oneBedroomRent : config.twoBedroomRent
      doc.fontSize(10).text(`Rent for ${unitType} Apartment: KSh ${expectedRent.toLocaleString()}/month`)
    }

    doc.moveDown(2)

    // Footer
    doc
      .fontSize(10)
      .text('Thank you for your payment!', { align: 'center' })
      .text('This is an official receipt for your records.', { align: 'center' })
      .moveDown()

    // Signature area
    doc.text('_________________________', { align: 'right' })
    doc.text('Authorized Signature', { align: 'right' })
      .moveDown()

    // Contact information
    doc
      .fontSize(8)
      .text(`${config.appName}`, { align: 'center' })
      .text('Montez A Apartments, Kizito Road', { align: 'center' })
      .text(`Email: ${config.email.from}`, { align: 'center' })
      .text('This is a computer-generated receipt. No physical signature required.', {
        align: 'center',
      })
  }

  async getReceiptFile(receiptId: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    })

    if (!receipt) {
      throw new Error('Receipt not found')
    }

    const filePath = path.join(config.receiptsPath, receipt.filePath)
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Receipt file not found')
    }

    // Update download count
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        downloaded: true,
        downloadedAt: new Date(),
        downloadCount: { increment: 1 },
      },
    })

    return filePath
  }
}
