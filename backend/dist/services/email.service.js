"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
class EmailService {
    transporter = null;
    constructor() {
        this.initializeTransporter();
    }
    initializeTransporter() {
        if (config_1.config.email.user && config_1.config.email.password) {
            this.transporter = nodemailer_1.default.createTransport({
                host: config_1.config.email.host,
                port: config_1.config.email.port,
                secure: config_1.config.email.secure,
                auth: {
                    user: config_1.config.email.user,
                    pass: config_1.config.email.password,
                },
            });
            console.log('✅ Email transporter initialized');
        }
        else {
            console.warn('⚠️  Email credentials not configured. Emails will be logged to console.');
        }
    }
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: config_1.config.email.from,
                to,
                subject,
                html,
            };
            if (this.transporter) {
                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Email sent to ${to}`);
            }
            else {
                // Log to console in development
                console.log('��� Email would be sent (development mode):');
                console.log('To:', to);
                console.log('Subject:', subject);
                console.log('HTML:', html);
            }
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(tenant, tempPassword) {
        const subject = `Welcome to ${config_1.config.appName}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .credentials { background: #e8f4fd; border-left: 4px solid #1E40AF; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to ${config_1.config.appName}!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${tenant.name}</strong>,</p>
              <p>Your account has been created successfully for apartment <strong>${tenant.apartment}</strong>.</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0;">Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${tenant.email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              
              <p><strong>Important:</strong> Please login and change your password immediately.</p>
              <p>Please login at <a href="${config_1.config.appUrl}/login">${config_1.config.appUrl}/login</a></p>
              
              <p style="margin-top: 30px;">
                <a href="${config_1.config.appUrl}/login" class="button">Login Now</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p><strong>${config_1.config.appName} Management</strong></p>
              <p>Email: ${config_1.config.email.from}</p>
              <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail(tenant.email, subject, html);
    }
    async sendPaymentNotification(payment, tenant) {
        const subject = `New Payment Received - ${config_1.config.appName}`;
        const adminEmail = config_1.config.email.from;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #34D399 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment-info { background: #f0fdf4; border: 1px solid #BBF7D0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Payment Received</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new payment has been submitted and is pending verification.</p>
              
              <div class="payment-info">
                <h3 style="margin-top: 0;">Payment Details:</h3>
                <p><strong>Tenant:</strong> ${tenant.name}</p>
                <p><strong>Apartment:</strong> ${tenant.apartment}</p>
                <p><strong>Amount:</strong> KSh ${payment.amount.toLocaleString()}</p>
                <p><strong>Type:</strong> ${payment.type}</p>
                <p><strong>Method:</strong> ${payment.method}</p>
                <p><strong>Month:</strong> ${payment.month}</p>
                <p><strong>Submitted:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
              </div>
              
              <p>Please login to the admin panel to verify this payment.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p><strong>${config_1.config.appName} System</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail(adminEmail, subject, html);
    }
    async sendReceiptEmail(tenant, receipt) {
        const subject = `Payment Receipt - ${config_1.config.appName}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .receipt-info { background: #f5f3ff; border: 1px solid #DDD6FE; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Payment Receipt</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${tenant.name}</strong>,</p>
              <p>Your payment has been verified and a receipt has been generated.</p>
              
              <div class="receipt-info">
                <h3 style="margin-top: 0;">Receipt Details:</h3>
                <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
                <p><strong>Generated:</strong> ${new Date(receipt.generatedAt).toLocaleString()}</p>
              </div>
              
              <p>You can download your receipt using the button below:</p>
              
              <p style="margin-top: 30px;">
                <a href="${config_1.config.appUrl}/api/receipts/${receipt.id}/download" class="button">Download Receipt</a>
              </p>
              
              <p>Or view it in your tenant portal.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p><strong>${config_1.config.appName} Management</strong></p>
              <p>Email: ${config_1.config.email.from}</p>
              <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail(tenant.email, subject, html);
    }
    async sendPaymentStatusNotification(tenant, payment) {
        const subject = `Payment ${payment.status === 'VERIFIED' ? 'Verified' : 'Rejected'} - ${config_1.config.appName}`;
        const statusColor = payment.status === 'VERIFIED' ? '#10B981' : '#EF4444';
        const statusText = payment.status === 'VERIFIED' ? 'verified successfully' : 'rejected';
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}99 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment-info { background: ${payment.status === 'VERIFIED' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${payment.status === 'VERIFIED' ? '#BBF7D0' : '#FECACA'}; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Payment ${payment.status === 'VERIFIED' ? 'Verified' : 'Rejected'}</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${tenant.name}</strong>,</p>
              <p>Your payment has been <strong>${statusText}</strong>.</p>
              
              <div class="payment-info">
                <h3 style="margin-top: 0;">Payment Details:</h3>
                <p><strong>Amount:</strong> KSh ${payment.amount.toLocaleString()}</p>
                <p><strong>Type:</strong> ${payment.type}</p>
                <p><strong>Month:</strong> ${payment.month}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${payment.status}</span></p>
                ${payment.adminNotes ? `<p><strong>Admin Notes:</strong> ${payment.adminNotes}</p>` : ''}
              </div>
              
              ${payment.status === 'VERIFIED' ? `
                <p>Your payment receipt is available for download in your tenant portal.</p>
              ` : `
                <p>If you have any questions about why your payment was rejected, please contact management.</p>
                <p>Login to submit your payment: <a href="${config_1.config.appUrl}/tenant/payments/new">${config_1.config.appUrl}/tenant/payments/new</a></p>
              `}
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p><strong>${config_1.config.appName} Management</strong></p>
              <p>Email: ${config_1.config.email.from}</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail(tenant.email, subject, html);
    }
    async sendBalanceNotification(tenant, balance) {
        const subject = `Balance Reminder - ${config_1.config.appName}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .balance-info { background: #fffbeb; border: 1px solid #FDE68A; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Balance Reminder</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${tenant.name}</strong>,</p>
              
              <div class="balance-info">
                <h3 style="margin-top: 0;">Current Balance:</h3>
                <p style="font-size: 24px; font-weight: bold; color: ${balance > 0 ? '#DC2626' : '#10B981'}">
                  KSh ${balance.toLocaleString()}
                </p>
                <p>Apartment: ${tenant.apartment}</p>
              </div>
              
              ${balance > 0 ? `
                <p>Please submit your payment to clear the outstanding balance.</p>
                <p>Login to submit your payment: <a href="${config_1.config.appUrl}/tenant/payments/new">${config_1.config.appUrl}/tenant/payments/new</a></p>
                
                <p style="margin-top: 30px;">
                  <a href="${config_1.config.appUrl}/tenant/payments/new" class="button">Make Payment</a>
                </p>
              ` : `
                <p>Your account is in good standing. Thank you for staying current with your payments.</p>
              `}
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p><strong>${config_1.config.appName} Management</strong></p>
              <p>Email: ${config_1.config.email.from}</p>
              <p style="color: #666; font-size: 12px;">This is an automated message from ${config_1.config.appName} System. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail(tenant.email, subject, html);
    }
    async sendMaintenanceUpdate(tenant, maintenance, updateType) {
        const subject = `Maintenance ${updateType ? updateType.charAt(0).toUpperCase() + updateType.slice(1) : 'Update'} - ${config_1.config.appName}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .maintenance-info { background: #eef2ff; border: 1px solid #C7D2FE; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Maintenance ${updateType ? updateType.charAt(0).toUpperCase() + updateType.slice(1) : 'Update'}</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${tenant.name}</strong>,</p>
              
              <div class="maintenance-info">
                <h3 style="margin-top: 0;">Maintenance Request #${maintenance.id?.slice(-8) || 'N/A'}</h3>
                <p><strong>Title:</strong> ${maintenance.title}</p>
                <p><strong>Status:</strong> ${maintenance.status}</p>
                <p><strong>Priority:</strong> ${maintenance.priority}</p>
                <p><strong>Updated:</strong> ${new Date(maintenance.updatedAt || maintenance.createdAt).toLocaleString()}</p>
                ${maintenance.resolutionNotes ? `<p><strong>Resolution Notes:</strong> ${maintenance.resolutionNotes}</p>` : ''}
              </div>
              
              <p>You can view the full details in your tenant portal.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p><strong>${config_1.config.appName} Management</strong></p>
              <p>Email: ${config_1.config.email.from}</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail(tenant.email, subject, html);
    }
}
exports.EmailService = EmailService;
