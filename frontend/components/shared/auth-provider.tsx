"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useApi } from '@/lib/api/context'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  apartment: string
  role: 'admin' | 'tenant'
  rentAmount: number
  balance: number
  waterRate?: number
  status?: string
  moveInDate?: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopyUrl?: string
  contractUrl?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const { auth } = useApi()
  const router = useRouter()

  // Mark as hydrated after first client-side render
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Check if user is already logged in on mount
  useEffect(() => {
    // Only run on client after hydration
    if (!isHydrated) return

    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token')
          const storedUser = localStorage.getItem('user')

          if (token && storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            console.log('✅ Auth restored from localStorage:', parsedUser.email)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isHydrated])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await auth.login({ email, password })

      if (response.success && response.user && response.token) {
        const { user, token, refreshToken } = response

        setUser(user)

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
          localStorage.setItem('accessToken', token)
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken)
          }
          localStorage.setItem('user', JSON.stringify(user))
        }

        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/tenant/dashboard')
        }

        return true
      } else {
        console.error('Login failed:', response.message)
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      setUser(null)
      router.push('/')
    }
  }

  // During SSR and before hydration, show nothing or a simple loading state
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}