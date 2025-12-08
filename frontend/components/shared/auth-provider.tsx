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
  role: 'ADMIN' | 'TENANT'
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
  const { auth } = useApi()
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Call REAL backend API
      const response = await auth.login({ email, password })
      
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data
        setUser(user)
        
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken || '')
        localStorage.setItem('user', JSON.stringify(user))
        
        // Redirect based on role
        if (user.role === 'ADMIN') {
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
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
