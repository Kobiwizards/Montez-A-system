'use client'

import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/shared/auth-provider'
import { ApiProvider } from '@/lib/api/context' // This will work after rename

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <title>Montez A Property Management</title>
        <meta name="description" content="Property management system for Montez A apartments" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ApiProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ApiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}