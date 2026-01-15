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

      // OPTION 4 IMPLEMENTATION STARTS HERE
      console.log('🔄 Attempting direct fetch with Option 4 fix...')
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      console.log('Direct fetch status:', response.status)
      const responseData = await response.json()
      console.log('Full response:', responseData)
      
      // Check if response has the expected format
      if (!response.ok || !responseData.success) {
        const errorMessage = responseData.message || 'Login failed'
        console.log('❌ Login failed:', errorMessage)
        setError(errorMessage)
        
        setDebugInfo(prev => prev + `
          Login Failed:
          Status: ${response.status}
          Message: ${errorMessage}
          Response: ${JSON.stringify(responseData, null, 2)}
        `)
        return
      }
      
      // ✅ SUCCESS - Extract data from backend format
      // Backend returns: { success: true, message: '...', data: { user, accessToken, refreshToken } }
      const { user, accessToken, refreshToken } = responseData.data
      
      if (!user || !accessToken) {
        console.error('❌ Invalid response format - missing user or token')
        setError('Invalid server response format')
        setDebugInfo(prev => prev + `
          Invalid Response Format:
          User exists: ${!!user}
          AccessToken exists: ${!!accessToken}
          Full data: ${JSON.stringify(responseData.data, null, 2)}
        `)
        return
      }
      
      console.log('✅ Login successful!')
      console.log('User:', user.email)
      console.log('Token (first 20 chars):', accessToken.substring(0, 20) + '...')
      console.log('User role:', user.role)
      
      // Save to localStorage
      localStorage.setItem('token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(user))
      
      // Update debug info
      setDebugInfo(prev => prev + `
        ✅ LOGIN SUCCESSFUL!
        User: ${user.email}
        Role: ${user.role}
        Token saved: ${accessToken.substring(0, 20)}...
        Redirecting to dashboard...
      `)
      
      // Redirect based on role
      // Using window.location.href instead of router.push to ensure full page reload
      // This will properly initialize the auth context
      if (user.role === 'ADMIN') {
        console.log('Redirecting to admin dashboard...')
        window.location.href = '/admin/dashboard'
      } else {
        console.log('Redirecting to tenant dashboard...')
        window.location.href = '/tenant/dashboard'
      }
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setDebugInfo(prev => prev + `
        Error: ${err.message}
        Stack: ${err.stack}
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
                    setDebugInfo(`
                      Testing with tenant credentials...
                      Email: john.kamau@monteza.com
                      Password: password123
                      API URL: ${process.env.NEXT_PUBLIC_API_URL}
                    `)
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