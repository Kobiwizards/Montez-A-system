'use client'

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

// Since this is a client component, you can't export metadata
// Define it as a constant instead
const metadata = {
  title: 'Montez A Property Management',
  description: 'Property management system for Montez A apartments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
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