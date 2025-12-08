"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptService = void 0;
const prisma_1 = require("../lib/prisma");
const index_1 = require("../config/index");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ReceiptService {
    async generateReceipt(payment) {
        // Generate receipt number
        const receiptNumber = `MTA-${new Date().getFullYear()}-${String(await this.getNextReceiptNumber()).padStart(4, '0')}`;
        // Create receipt directory if it doesn't exist
        const receiptDir = path_1.default.join(index_1.config.receiptsPath);
        if (!fs_1.default.existsSync(receiptDir)) {
            fs_1.default.mkdirSync(receiptDir, { recursive: true });
        }
        // Generate PDF
        const fileName = `${receiptNumber}.pdf`;
        const filePath = path_1.default.join(receiptDir, fileName);
        await this.generatePDF(payment, receiptNumber, filePath);
        // Save receipt record
        const receipt = await prisma_1.prisma.receipt.create({
            data: {
                paymentId: payment.id,
                tenantId: payment.tenantId,
                receiptNumber,
                filePath: fileName,
                generatedAt: new Date(),
            },
        });
        return receipt;
    }
    async getNextReceiptNumber() {
        const currentYear = new Date().getFullYear();
        const lastReceipt = await prisma_1.prisma.receipt.findFirst({
            where: {
                receiptNumber: {
                    startsWith: `MTA-${currentYear}-`,
                },
            },
            orderBy: { receiptNumber: 'desc' },
        });
        if (!lastReceipt) {
            return 1;
        }
        const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2]);
        return lastNumber + 1;
    }
    async generatePDF(payment, receiptNumber, filePath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
                const stream = fs_1.default.createWriteStream(filePath);
                doc.pipe(stream);
                // Header
                doc.fontSize(20).text(index_1.config.appName, { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(16).text('Official Receipt', { align: 'center' });
                doc.moveDown(1);
                // Receipt Number
                doc.fontSize(12).text(`Receipt Number: ${receiptNumber}`, { align: 'right' });
                doc.moveDown(1);
                // Divider
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
                // Property Details
                doc.fontSize(12).text('Property Details:', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10).text(`Montez A Apartments`);
                doc.text(`Kizito Road`);
                doc.text(`Nairobi, Kenya`);
                doc.moveDown(1);
                // Tenant Details
                doc.fontSize(12).text('Tenant Details:', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10).text(`Name: ${payment.tenant.name}`);
                doc.text(`Apartment: ${payment.tenant.apartment}`);
                doc.text(`Email: ${payment.tenant.email}`);
                doc.text(`Phone: ${payment.tenant.phone}`);
                doc.moveDown(1);
                // Payment Details
                doc.fontSize(12).text('Payment Details:', { underline: true });
                doc.moveDown(0.5);
                const paymentDetails = [
                    ['Payment Type', payment.type],
                    ['Payment Method', payment.method],
                    ['Amount', `KSh ${payment.amount.toLocaleString()}`],
                    ['Month', payment.month],
                    ['Date Paid', new Date(payment.createdAt).toLocaleDateString()],
                ];
                if (payment.transactionCode) {
                    paymentDetails.push(['Transaction Code', payment.transactionCode]);
                }
                if (payment.caretakerName) {
                    paymentDetails.push(['Caretaker Name', payment.caretakerName]);
                }
                paymentDetails.forEach(([label, value]) => {
                    doc.fontSize(10).text(`${label}:`, { continued: true });
                    doc.text(` ${value}`, { align: 'right' });
                });
                doc.moveDown(2);
                // Water details if applicable
                if (payment.type === 'WATER' || payment.type === 'RENT') {
                    // Water readings will be handled separately
                }
                // Amount in words
                doc.fontSize(10).text(`Amount in Words: ${this.numberToWords(payment.amount)} Kenya Shillings`);
                doc.moveDown(2);
                // Total
                doc.fontSize(14).font('Helvetica-Bold').text(`Total: KSh ${payment.amount.toLocaleString()}`, { align: 'right' });
                doc.font('Helvetica'); // Reset font
                doc.moveDown(3);
                // Footer
                doc.fontSize(10).text('For Office Use Only:', { underline: true });
                doc.moveDown(0.5);
                doc.text(`Received by: _________________________`);
                doc.text(`Date: ${new Date().toLocaleDateString()}`);
                doc.text(`Signature: _________________________`);
                doc.moveDown(2);
                doc.fontSize(8).text('This is a computer generated receipt. No signature required.', { align: 'center' });
                doc.text('Thank you for your payment!', { align: 'center' });
                doc.end();
                stream.on('finish', resolve);
                stream.on('error', reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    numberToWords(num) {
        const units = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];
        if (num === 0)
            return 'Zero';
        let words = '';
        if (num >= 1000) {
            words += this.numberToWords(Math.floor(num / 1000)) + ' Thousand ';
            num %= 1000;
        }
        if (num >= 100) {
            words += units[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num > 0) {
            if (words !== '')
                words += 'and ';
            if (num < 20) {
                words += units[num];
            }
            else {
                words += tens[Math.floor(num / 10)];
                if (num % 10 > 0) {
                    words += ' ' + units[num % 10];
                }
            }
        }
        return words.trim();
    }
    async getReceipt(receiptId) {
        const receipt = await prisma_1.prisma.receipt.findUnique({
            where: { id: receiptId },
            include: {
                payment: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });
        if (!receipt) {
            throw new Error('Receipt not found');
        }
        return receipt;
    }
    async downloadReceipt(receiptId) {
        const receipt = await this.getReceipt(receiptId);
        // Update download stats
        await prisma_1.prisma.receipt.update({
            where: { id: receiptId },
            data: {
                downloaded: true,
                downloadedAt: new Date(),
                downloadCount: { increment: 1 },
            },
        });
        const filePath = path_1.default.join(index_1.config.receiptsPath, receipt.filePath);
        // Check if file exists using fs.existsSync
        if (!fs_1.default.existsSync(filePath)) {
            // Regenerate if file doesn't exist
            const payment = await prisma_1.prisma.payment.findUnique({
                where: { id: receipt.paymentId },
                include: { tenant: true },
            });
            if (!payment) {
                throw new Error('Payment not found');
            }
            await this.generateReceipt(payment);
        }
        return {
            filePath,
            receiptNumber: receipt.receiptNumber,
            fileName: `receipt-${receipt.receiptNumber}.pdf`,
        };
    }
    async getReceiptsByTenant(tenantId, filters = {}) {
        const { startDate, endDate, page = 1, limit = 20, } = filters;
        const skip = (page - 1) * limit;
        const where = {
            payment: { tenantId },
        };
        if (startDate || endDate) {
            where.generatedAt = {};
            if (startDate)
                where.generatedAt.gte = startDate;
            if (endDate)
                where.generatedAt.lte = endDate;
        }
        const [receipts, total] = await Promise.all([
            prisma_1.prisma.receipt.findMany({
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
            prisma_1.prisma.receipt.count({ where }),
        ]);
        return {
            receipts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async generateBulkReceipts(paymentIds) {
        const results = {
            successful: [],
            failed: [],
        };
        for (const paymentId of paymentIds) {
            try {
                const payment = await prisma_1.prisma.payment.findUnique({
                    where: { id: paymentId },
                    include: { tenant: true },
                });
                if (!payment) {
                    throw new Error('Payment not found');
                }
                if (payment.status !== 'VERIFIED') {
                    throw new Error('Only verified payments can have receipts');
                }
                // Check if receipt already exists
                const existingReceipt = await prisma_1.prisma.receipt.findFirst({
                    where: { paymentId },
                });
                if (existingReceipt) {
                    throw new Error('Receipt already exists');
                }
                const receipt = await this.generateReceipt(payment);
                results.successful.push(receipt.id);
            }
            catch (error) {
                results.failed.push({
                    id: paymentId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return results;
    }
    async deleteReceipt(receiptId) {
        const receipt = await prisma_1.prisma.receipt.findUnique({
            where: { id: receiptId },
        });
        if (!receipt) {
            throw new Error('Receipt not found');
        }
        // Delete file using fs.unlinkSync
        const filePath = path_1.default.join(index_1.config.receiptsPath, receipt.filePath);
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.warn('Failed to delete receipt file:', error);
        }
        // Delete from database
        await prisma_1.prisma.receipt.delete({
            where: { id: receiptId },
        });
        return receipt;
    }
}
exports.ReceiptService = ReceiptService;
//# sourceMappingURL=receipt.service.js.map