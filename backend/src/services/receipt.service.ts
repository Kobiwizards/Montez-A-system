import { prisma } from '../lib/prisma'
import { config } from '../config'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs/promises'
import { Payment, User } from '@prisma/client'

export interface ReceiptData {
  receiptNumber: string
  payment: Payment
  tenant: User
  generatedAt: Date
}

export class ReceiptService {
  async generateReceipt(payment: Payment & { tenant: User }) {
    // Generate receipt number
    const receiptNumber = `MTA-${new Date().getFullYear()}-${String(
      await this.getNextReceiptNumber()
    ).padStart(4, '0')}`

    // Create receipt directory if it doesn't exist
    const receiptDir = path.join(config.receiptsPath)
    await fs.mkdir(receiptDir, { recursive: true })

    // Generate PDF
    const fileName = `${receiptNumber}.pdf`
    const filePath = path.join(receiptDir, fileName)

    await this.generatePDF(payment, receiptNumber, filePath)

    // Save receipt record
    const receipt = await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        receiptNumber,
        filePath: fileName,
        generatedAt: new Date(),
      },
    })

    return receipt
  }

  private async getNextReceiptNumber(): Promise<number> {
    const currentYear = new Date().getFullYear()
    
    const lastReceipt = await prisma.receipt.findFirst({
      where: {
        receiptNumber: {
          startsWith: `MTA-${currentYear}-`,
        },
      },
      orderBy: { receiptNumber: 'desc' },
    })

    if (!lastReceipt) {
      return 1
    }

    const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2])
    return lastNumber + 1
  }

  private async generatePDF(
    payment: Payment & { tenant: User },
    receiptNumber: string,
    filePath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const stream = fs.createWriteStream(filePath)

      doc.pipe(stream)

      // Header
      doc.fontSize(20).text(config.appName, { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(16).text('Official Receipt', { align: 'center' })
      doc.moveDown(1)

      // Receipt Number
      doc.fontSize(12).text(`Receipt Number: ${receiptNumber}`, { align: 'right' })
      doc.moveDown(1)

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown(1)

      // Property Details
      doc.fontSize(12).text('Property Details:', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).text(`Montez A Apartments`)
      doc.text(`Kizito Road`)
      doc.text(`Nairobi, Kenya`)
      doc.moveDown(1)

      // Tenant Details
      doc.fontSize(12).text('Tenant Details:', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).text(`Name: ${payment.tenant.name}`)
      doc.text(`Apartment: ${payment.tenant.apartment}`)
      doc.text(`Email: ${payment.tenant.email}`)
      doc.text(`Phone: ${payment.tenant.phone}`)
      doc.moveDown(1)

      // Payment Details
      doc.fontSize(12).text('Payment Details:', { underline: true })
      doc.moveDown(0.5)

      const paymentDetails = [
        ['Payment Type', payment.type],
        ['Payment Method', payment.method],
        ['Amount', `KSh ${payment.amount.toLocaleString()}`],
        ['Month', payment.month],
        ['Date Paid', new Date(payment.createdAt).toLocaleDateString()],
      ]

      if (payment.transactionCode) {
        paymentDetails.push(['Transaction Code', payment.transactionCode])
      }

      if (payment.caretakerName) {
        paymentDetails.push(['Caretaker Name', payment.caretakerName])
      }

      paymentDetails.forEach(([label, value]) => {
        doc.fontSize(10).text(`${label}:`, { continued: true })
        doc.text(` ${value}`, { align: 'right' })
      })

      doc.moveDown(2)

      // Water details if applicable
      if (payment.type === 'WATER' || payment.type === 'RENT') {
        const waterReadings = await prisma.waterReading.findMany({
          where: {
            tenantId: payment.tenantId,
            month: payment.month,
          },
        })

        if (waterReadings.length > 0) {
          doc.fontSize(12).text('Water Consumption:', { underline: true })
          doc.moveDown(0.5)

          waterReadings.forEach(reading => {
            doc.fontSize(10).text(`Units: ${reading.units} x KSh ${reading.rate} = KSh ${reading.amount.toLocaleString()}`)
          })
          doc.moveDown(1)
        }
      }

      // Amount in words
      doc.fontSize(10).text(`Amount in Words: ${this.numberToWords(payment.amount)} Kenya Shillings`)
      doc.moveDown(2)

      // Total
      doc.fontSize(14).text(`Total: KSh ${payment.amount.toLocaleString()}`, { align: 'right', bold: true })
      doc.moveDown(3)

      // Footer
      doc.fontSize(10).text('For Office Use Only:', { underline: true })
      doc.moveDown(0.5)
      doc.text(`Received by: _________________________`)
      doc.text(`Date: ${new Date().toLocaleDateString()}`)
      doc.text(`Signature: _________________________`)
      doc.moveDown(2)

      doc.fontSize(8).text('This is a computer generated receipt. No signature required.', { align: 'center' })
      doc.text('Thank you for your payment!', { align: 'center' })

      doc.end()

      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }

  private numberToWords(num: number): string {
    const units = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ]
    
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ]

    if (num === 0) return 'Zero'

    let words = ''

    if (num >= 1000) {
      words += this.numberToWords(Math.floor(num / 1000)) + ' Thousand '
      num %= 1000
    }

    if (num >= 100) {
      words += units[Math.floor(num / 100)] + ' Hundred '
      num %= 100
    }

    if (num > 0) {
      if (words !== '') words += 'and '

      if (num < 20) {
        words += units[num]
      } else {
        words += tens[Math.floor(num / 10)]
        if (num % 10 > 0) {
          words += ' ' + units[num % 10]
        }
      }
    }

    return words.trim()
  }

  async getReceipt(receiptId: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        payment: {
          include: {
            tenant: true,
          },
        },
      },
    })

    if (!receipt) {
      throw new Error('Receipt not found')
    }

    return receipt
  }

  async downloadReceipt(receiptId: string) {
    const receipt = await this.getReceipt(receiptId)

    // Update download stats
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        downloaded: true,
        downloadedAt: new Date(),
        downloadCount: { increment: 1 },
      },
    })

    const filePath = path.join(config.receiptsPath, receipt.filePath)

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      // Regenerate if file doesn't exist
      const payment = await prisma.payment.findUnique({
        where: { id: receipt.paymentId },
        include: { tenant: true },
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      await this.generateReceipt(payment)
    }

    return {
      filePath,
      receiptNumber: receipt.receiptNumber,
      fileName: `receipt-${receipt.receiptNumber}.pdf`,
    }
  }

  async getReceiptsByTenant(tenantId: string, filters: {
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  } = {}) {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit

    const where: any = {
      payment: { tenantId },
    }

    if (startDate || endDate) {
      where.generatedAt = {}
      if (startDate) where.generatedAt.gte = startDate
      if (endDate) where.generatedAt.lte = endDate
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { generatedAt: 'desc' },
        include: {
          payment: {
            select: {
              type: true,
              amount: true,
              month: true,
              method: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.receipt.count({ where }),
    ])

    return {
      receipts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async generateBulkReceipts(paymentIds: string[]) {
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    }

    for (const paymentId of paymentIds) {
      try {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: { tenant: true },
        })

        if (!payment) {
          throw new Error('Payment not found')
        }

        if (payment.status !== 'VERIFIED') {
          throw new Error('Only verified payments can have receipts')
        }

        // Check if receipt already exists
        const existingReceipt = await prisma.receipt.findFirst({
          where: { paymentId },
        })

        if (existingReceipt) {
          throw new Error('Receipt already exists')
        }

        const receipt = await this.generateReceipt(payment)
        results.successful.push(receipt.id)
      } catch (error) {
        results.failed.push({
          id: paymentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  async deleteReceipt(receiptId: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    })

    if (!receipt) {
      throw new Error('Receipt not found')
    }

    // Delete file
    const filePath = path.join(config.receiptsPath, receipt.filePath)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.warn('Failed to delete receipt file:', error)
    }

    // Delete from database
    await prisma.receipt.delete({
      where: { id: receiptId },
    })

    return receipt
  }
}