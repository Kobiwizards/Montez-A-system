import nodemailer from 'nodemailer'
import { config } from '../config'
import { User, Payment, Receipt } from '@prisma/client'

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    if (config.emailHost) {
      this.transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailPort === 465,
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        },
      })
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      console.log('Email service not configured. Would send email:', {
        to,
        subject,
        html,
      })
      return
    }

    try {
      await this.transporter.sendMail({
        from: config.emailFrom,
        to,
        subject,
        html,
      })
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  async sendWelcomeEmail(tenant: User, tempPassword: string) {
    const subject = `Welcome to ${config.appName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E40AF;">Welcome to ${config.appName}!</h2>
        
        <p>Dear ${tenant.name},</p>
        
        <p>Your account has been created successfully. Here are your login details:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${tenant.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>Apartment:</strong> ${tenant.apartment}</p>
          <p><strong>Monthly Rent:</strong> KSh ${tenant.rentAmount.toLocaleString()}</p>
        </div>
        
        <p>Please login at <a href="${config.appUrl}/login">${config.appUrl}/login</a> and change your password immediately.</p>
        
        <p>You can use the system to:</p>
        <ul>
          <li>View your balance and payment history</li>
          <li>Upload payment proofs (M-Pesa screenshots or cash receipts)</li>
          <li>Download payment receipts</li>
          <li>Calculate water bills</li>
          <li>Submit maintenance requests</li>
        </ul>
        
        <p>If you have any questions, please contact the management.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
        <p>Kizito Road, Nairobi</p>
        <p>Email: ${config.emailFrom}</p>
      </div>
    `

    await this.sendEmail(tenant.email, subject, html)
  }

  async sendPaymentNotification(payment: Payment, tenant: User) {
    const subject = `New Payment Submitted - ${payment.type} for ${payment.month}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E40AF;">New Payment Submitted</h2>
        
        <p>A new payment has been submitted and is awaiting verification:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tenant:</strong> ${tenant.name} (${tenant.apartment})</p>
          <p><strong>Payment Type:</strong> ${payment.type}</p>
          <p><strong>Amount:</strong> KSh ${payment.amount.toLocaleString()}</p>
          <p><strong>Month:</strong> ${payment.month}</p>
          <p><strong>Method:</strong> ${payment.method}</p>
          <p><strong>Submitted:</strong> ${new Date(payment.createdAt).toLocaleString()}</p>
        </div>
        
        <p>Please login to the admin portal to verify this payment.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} System</strong></p>
      </div>
    `

    // Send to admin (in a real system, you would get admin emails from database)
    const adminEmail = config.emailFrom
    await this.sendEmail(adminEmail, subject, html)
  }

  async sendPaymentStatusNotification(tenant: User, payment: Payment) {
    const subject = `Payment ${payment.status.toLowerCase()} - ${payment.type} for ${payment.month}`
    
    let statusMessage = ''
    if (payment.status === 'VERIFIED') {
      statusMessage = `
        <p>Your payment has been verified and processed successfully.</p>
        <p>You can download your receipt from your tenant portal.</p>
      `
    } else if (payment.status === 'REJECTED') {
      statusMessage = `
        <p>Your payment has been rejected.</p>
        ${payment.adminNotes ? `<p><strong>Reason:</strong> ${payment.adminNotes}</p>` : ''}
        <p>Please submit a new payment with correct information.</p>
      `
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${payment.status === 'VERIFIED' ? '#10B981' : '#EF4444'};">
          Payment ${payment.status}
        </h2>
        
        <p>Dear ${tenant.name},</p>
        
        <p>Your payment details:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Payment Type:</strong> ${payment.type}</p>
          <p><strong>Amount:</strong> KSh ${payment.amount.toLocaleString()}</p>
          <p><strong>Month:</strong> ${payment.month}</p>
          <p><strong>Method:</strong> ${payment.method}</p>
          <p><strong>Status:</strong> ${payment.status}</p>
          <p><strong>Date Processed:</strong> ${new Date(payment.verifiedAt || payment.createdAt).toLocaleString()}</p>
        </div>
        
        ${statusMessage}
        
        <p>Login to your tenant portal at <a href="${config.appUrl}/tenant/dashboard">${config.appUrl}/tenant/dashboard</a></p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
      </div>
    `

    await this.sendEmail(tenant.email, subject, html)
  }

  async sendReceiptEmail(tenant: User, receipt: Receipt) {
    const subject = `Payment Receipt - ${receipt.receiptNumber}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E40AF;">Payment Receipt</h2>
        
        <p>Dear ${tenant.name},</p>
        
        <p>Your payment receipt has been generated. Details:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
          <p><strong>Generated Date:</strong> ${new Date(receipt.generatedAt).toLocaleString()}</p>
        </div>
        
        <p>You can download your receipt from your tenant portal or by clicking the link below:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${config.appUrl}/api/receipts/${receipt.id}/download" 
             style="background: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download Receipt
          </a>
        </p>
        
        <p>Please keep this receipt for your records.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
      </div>
    `

    await this.sendEmail(tenant.email, subject, html)
  }

  async sendPaymentReminder(tenant: User, month: string) {
    const subject = `Payment Reminder - ${month} Rent Due`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Payment Reminder</h2>
        
        <p>Dear ${tenant.name},</p>
        
        <p>This is a friendly reminder that your rent payment for <strong>${month}</strong> is due.</p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Apartment:</strong> ${tenant.apartment}</p>
          <p><strong>Amount Due:</strong> KSh ${tenant.rentAmount.toLocaleString()}</p>
          <p><strong>Current Balance:</strong> KSh ${tenant.balance.toLocaleString()}</p>
          <p><strong>Due Date:</strong> 5th of each month</p>
        </div>
        
        <p>Please make your payment through one of the following methods:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Payment Methods:</h4>
          
          <p><strong>M-Pesa:</strong></p>
          <ol>
            <li>Go to M-Pesa Menu</li>
            <li>Select "Lipa Na M-Pesa"</li>
            <li>Enter Business Number: <strong>555555</strong></li>
            <li>Enter Account Number: <strong>${tenant.apartment}</strong></li>
            <li>Enter Amount: <strong>${tenant.rentAmount}</strong></li>
            <li>Enter your PIN</li>
            <li>Upload screenshot in tenant portal</li>
          </ol>
          
          <p><strong>Cash:</strong></p>
          <p>Pay to the caretaker and get a signed receipt. Upload the receipt in your tenant portal.</p>
        </div>
        
        <p>Login to submit your payment: <a href="${config.appUrl}/tenant/payments/new">${config.appUrl}/tenant/payments/new</a></p>
        
        <p>Please ignore this message if you have already made the payment.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
      </div>
    `

    await this.sendEmail(tenant.email, subject, html)
  }

  async sendBalanceNotification(tenant: User, newBalance: number) {
    const subject = `Account Balance Update - ${tenant.apartment}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${newBalance > 0 ? '#EF4444' : '#10B981'};">Account Balance Update</h2>
        
        <p>Dear ${tenant.name},</p>
        
        <p>Your account balance has been updated:</p>
        
        <div style="background: ${newBalance > 0 ? '#fee2e2' : '#d1fae5'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Apartment:</strong> ${tenant.apartment}</p>
          <p><strong>New Balance:</strong> KSh ${newBalance.toLocaleString()}</p>
          <p><strong>Status:</strong> ${newBalance > 0 ? 'OVERDUE' : 'CURRENT'}</p>
          ${newBalance > 0 ? `<p style="color: #EF4444;"><strong>⚠️ Action Required:</strong> Please clear your outstanding balance.</p>` : ''}
        </div>
        
        ${newBalance > 0 ? `
          <p>Please make a payment to clear your outstanding balance as soon as possible.</p>
          <p>Login to submit your payment: <a href="${config.appUrl}/tenant/payments/new">${config.appUrl}/tenant/payments/new</a></p>
        ` : `
          <p>Your account is now up to date. Thank you for your prompt payment!</p>
        `}
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
      </div>
    `

    await this.sendEmail(tenant.email, subject, html)
  }

  async sendMaintenanceUpdate(tenant: User, request: any, updateType: 'created' | 'updated' | 'resolved') {
    const subjects = {
      created: 'New Maintenance Request Submitted',
      updated: 'Maintenance Request Updated',
      resolved: 'Maintenance Request Resolved',
    }

    const colors = {
      created: '#3B82F6',
      updated: '#F59E0B',
      resolved: '#10B981',
    }

    const subject = subjects[updateType]
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${colors[updateType]};">${subject}</h2>
        
        <p>Dear ${tenant.name},</p>
        
        <p>Your maintenance request has been ${updateType}:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Request ID:</strong> ${request.id}</p>
          <p><strong>Title:</strong> ${request.title}</p>
          <p><strong>Description:</strong> ${request.description}</p>
          <p><strong>Priority:</strong> ${request.priority}</p>
          <p><strong>Status:</strong> ${request.status}</p>
          <p><strong>Apartment:</strong> ${request.apartment}</p>
          ${request.resolvedAt ? `<p><strong>Resolved Date:</strong> ${new Date(request.resolvedAt).toLocaleString()}</p>` : ''}
          ${request.resolutionNotes ? `<p><strong>Resolution Notes:</strong> ${request.resolutionNotes}</p>` : ''}
          ${request.cost ? `<p><strong>Cost:</strong> KSh ${request.cost.toLocaleString()}</p>` : ''}
        </div>
        
        <p>You can view the status of your maintenance requests in your tenant portal.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
      </div>
    `

    await this.sendEmail(tenant.email, subject, html)
  }

  async sendSystemNotification(to: string, subject: string, message: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E40AF;">${subject}</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>
        
        <p>This is an automated message from ${config.appName} System.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>${config.appName} Management</strong></p>
      </div>
    `

    await this.sendEmail(to, subject, html)
  }
}