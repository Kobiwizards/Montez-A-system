'use client' // ADD THIS LINE AT THE TOP

import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/shared/auth-provider'
import { ApiProvider } from '@/lib/api/context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// REMOVE the metadata export since it's now a client component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
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