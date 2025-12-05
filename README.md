# Montez A Property Management System

A modern, professional property management system for Montez A Apartments along Kizito Road. This system streamlines rent collection, automates receipts, and provides real-time analytics for both tenants and administrators.

## Features

### 🏠 Tenant Portal
- Dashboard with current balance and payment status
- Multi-file upload for payment proofs (M-Pesa screenshots, receipts)
- Water bill calculator (units × KSh 150)
- Downloadable professional receipts
- Payment history with filtering
- Profile management
- Clear payment instructions

### 👔 Admin Portal
- Real-time occupancy dashboard
- Payment verification queue
- Tenant management with balance tracking
- Financial analytics and reports
- Automated receipt generation
- Water bill management
- Exportable reports (Excel/PDF)

### 🔧 Technical Features
- Dark theme with blue/white accents
- Responsive design (mobile-friendly)
- Drag & drop file upload
- Real-time notifications
- PDF receipt generation
- Secure authentication
- Type-safe with TypeScript

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand
- **Authentication:** JWT tokens
- **PDF Generation:** PDFKit

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd montez-a-frontend