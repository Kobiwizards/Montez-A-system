"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Lock, Mail, Eye, EyeOff, Bug } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/shared/auth-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDebugInfo('')
    setIsLoading(true)

    try {
      // Debug logging
      console.log('🔍 DEBUG LOGIN START ====================')
      console.log('Email:', email)
      console.log('Password:', password)
      console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL)
      const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
      console.log('Full Login URL:', loginUrl)
      console.log('Environment:', process.env.NODE_ENV)

      // Create debug info for display
      setDebugInfo(`
        API URL: ${process.env.NEXT_PUBLIC_API_URL}
        Full URL: ${loginUrl}
        Environment: ${process.env.NODE_ENV}
        Attempting login for: ${email}
      `)

      const success = await login(email, password)
      
      if (!success) {
        setError('Invalid credentials. Please try again.')
        console.log('❌ Login failed via auth hook')
        
        // Try direct fetch to debug
        try {
          console.log('🔄 Attempting direct fetch...')
          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          })
          
          console.log('Direct fetch status:', response.status)
          console.log('Direct fetch headers:', response.headers)
          const data = await response.json()
          console.log('Direct fetch response:', data)
          
          setDebugInfo(prev => prev + `
            Direct Fetch Status: ${response.status}
            Direct Fetch Response: ${JSON.stringify(data, null, 2)}
          `)
        } catch (fetchError) {
          console.error('Direct fetch failed:', fetchError)
          setDebugInfo(prev => prev + `
            Direct Fetch Error: ${fetchError}
          `)
        }
      } else {
        console.log('✅ Login successful via auth hook')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
      setDebugInfo(prev => prev + `
        Error: ${err}
      `)
    } finally {
      setIsLoading(false)
      console.log('🔍 DEBUG LOGIN END ====================')
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your Montez A account</p>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the management portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Debug info - only show in development or when there's an error */}
            {(process.env.NODE_ENV === 'development' || debugInfo) && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-xs font-mono whitespace-pre">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4" />
                    <span className="font-semibold">Debug Info:</span>
                  </div>
                  {debugInfo}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-focus"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-focus pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-secondary-800">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-4">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmail('john.kamau@monteza.com')
                    setPassword('password123')
                  }}
                >
                  Tenant Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmail('admin@monteza.com')
                    setPassword('admin123')
                    // Auto-log debug info
                    setDebugInfo(`
                      Testing with admin credentials...
                      Email: admin@monteza.com
                      Password: admin123
                      API URL: ${process.env.NEXT_PUBLIC_API_URL}
                    `)
                  }}
                >
                  Admin Demo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Need help? Contact support at{' '}
          <a href="mailto:support@monteza.com" className="text-primary hover:underline">
            support@monteza.com
          </a>
        </p>
        <p className="mt-2 text-xs">
          Backend URL: {process.env.NEXT_PUBLIC_API_URL}
        </p>
      </div>
    </div>
  )
}