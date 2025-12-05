# Montez A Property Management System - Backend

A complete backend system for Montez A Apartments property management. Built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Tenant Management**: Complete CRUD operations for tenant management
- **Payment Processing**: M-Pesa, cash, and bank transfer payments with verification
- **Receipt Generation**: Automated PDF receipt generation
- **Water Billing**: Water consumption tracking and billing
- **Maintenance Requests**: Tenant maintenance request system
- **Real-time Updates**: WebSocket support for live notifications
- **Analytics Dashboard**: Comprehensive financial and occupancy analytics
- **Audit Logging**: Complete audit trail for all actions
- **File Upload**: Secure file upload for payment proofs

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Real-time**: WebSocket
- **Validation**: Zod
- **Logging**: Morgan + Winston

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd montez-a-backend