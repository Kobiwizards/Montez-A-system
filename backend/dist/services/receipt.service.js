"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const date_fns_1 = require("date-fns");
class ReceiptService {
    constructor() {
        this.receiptDir = process.env.RECEIPT_DIR || './receipts';
        if (!fs_1.default.existsSync(this.receiptDir)) {
            fs_1.default.mkdirSync(this.receiptDir, { recursive: true });
        }
    }
    async generateReceipt(data) {
        return new Promise((resolve, reject) => {
            try {
                const filename = `${data.receiptNumber}.pdf`;
                const filePath = path_1.default.join(this.receiptDir, filename);
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: `Receipt ${data.receiptNumber}`,
                        Author: 'Montez A Property Management',
                        Subject: 'Payment Receipt'
                    }
                });
                const stream = fs_1.default.createWriteStream(filePath);
                doc.pipe(stream);
                // Header
                this.addHeader(doc, data);
                // Receipt details
                this.addReceiptDetails(doc, data);
                // Payment details
                this.addPaymentDetails(doc, data);
                // Footer
                this.addFooter(doc);
                doc.end();
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    addHeader(doc, data) {
        // Logo or title
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .text('MONTEZ A APARTMENTS', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14)
            .font('Helvetica')
            .text('Property Management System', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('PAYMENT RECEIPT', { align: 'center', underline: true });
        doc.moveDown();
        doc.fontSize(12)
            .font('Helvetica')
            .text(`Receipt No: ${data.receiptNumber}`, { align: 'right' })
            .text(`Date: ${(0, date_fns_1.format)(data.date, 'dd/MM/yyyy HH:mm')}`, { align: 'right' });
        doc.moveDown(2);
    }
    addReceiptDetails(doc, data) {
        doc.fontSize(12)
            .font('Helvetica')
            .text('RECEIPT DETAILS', { underline: true });
        doc.moveDown(0.5);
        doc.font('Helvetica')
            .text(`Tenant: ${data.tenantName}`)
            .text(`Apartment: ${data.apartment}`)
            .text(`Payment Type: ${data.paymentType}`)
            .text(`Month: ${data.month}`);
        if (data.transactionCode) {
            doc.text(`Transaction Code: ${data.transactionCode}`);
        }
        if (data.caretakerName) {
            doc.text(`Caretaker: ${data.caretakerName}`);
        }
        doc.moveDown();
    }
    addPaymentDetails(doc, data) {
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('PAYMENT SUMMARY', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text(`Amount: KSh ${data.amount.toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12)
            .font('Helvetica')
            .text('Amount in words:', { underline: true });
        const amountInWords = this.numberToWords(data.amount);
        doc.text(`${amountInWords} Kenya Shillings Only`);
        doc.moveDown(2);
    }
    addFooter(doc) {
        doc.moveDown(4);
        doc.fontSize(10)
            .font('Helvetica')
            .text('________________________________', { align: 'center' })
            .text('Authorized Signature', { align: 'center' });
        doc.moveDown();
        doc.text('Montez A Property Management', { align: 'center' })
            .text('Kizito Road, Nairobi', { align: 'center' })
            .text('Email: admin@monteza.com | Phone: +254 712 345 678', { align: 'center' });
        doc.moveDown();
        doc.fontSize(9)
            .font('Helvetica-Oblique')
            .text('This is a computer-generated receipt. No signature required.', { align: 'center' })
            .text('Valid for official purposes only.', { align: 'center' });
    }
    numberToWords(num) {
        // Simplified number to words conversion
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if (num === 0)
            return 'Zero';
        let words = '';
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        if (thousands > 0) {
            words += this.numberToWords(thousands) + ' Thousand ';
        }
        if (remainder > 0) {
            const hundreds = Math.floor(remainder / 100);
            const tensAndOnes = remainder % 100;
            if (hundreds > 0) {
                words += units[hundreds] + ' Hundred ';
            }
            if (tensAndOnes > 0) {
                if (tensAndOnes < 10) {
                    words += units[tensAndOnes] + ' ';
                }
                else if (tensAndOnes < 20) {
                    words += teens[tensAndOnes - 10] + ' ';
                }
                else {
                    const tensDigit = Math.floor(tensAndOnes / 10);
                    const onesDigit = tensAndOnes % 10;
                    words += tens[tensDigit] + ' ';
                    if (onesDigit > 0) {
                        words += units[onesDigit] + ' ';
                    }
                }
            }
        }
        return words.trim();
    }
    async getReceiptPath(receiptNumber) {
        const filePath = path_1.default.join(this.receiptDir, `${receiptNumber}.pdf`);
        return fs_1.default.existsSync(filePath) ? filePath : null;
    }
    async deleteReceipt(receiptNumber) {
        const filePath = path_1.default.join(this.receiptDir, `${receiptNumber}.pdf`);
        if (fs_1.default.existsSync(filePath)) {
            await fs_1.default.promises.unlink(filePath);
        }
    }
}
exports.ReceiptService = ReceiptService;
