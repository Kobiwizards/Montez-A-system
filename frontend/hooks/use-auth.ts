import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api/client'
import { LoginCredentials, RegisterData, ChangePasswordData } from '@/types/auth.types'

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    setLoading,
    login: storeLogin,
    logout: storeLogout,
    updateProfile: storeUpdateProfile,
  } = useAuthStore()

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken && !user) {
        try {
          setLoading(true)
          const response = await api.get<any>('/auth/profile')
          
          const data = response as any
          
          if (data.success && data.data) {
            setUser(data.data)
          }
        } catch (error) {
          console.error('Failed to load user profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    initAuth()
  }, [accessToken, user, setUser, setLoading])

  // Redirect if not authenticated for protected routes
  useEffect(() => {
    const protectedRoutes = ['/admin', '/tenant', '/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))
    
    if (isProtectedRoute && !isAuthenticated && !isLoading) {
      router.push('/login')
    }
  }, [pathname, isAuthenticated, isLoading, router])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      const response = await api.post<any>('/auth/login', credentials)
      
      const data = response as any
      
      // ✅ FIXED: Check direct properties, not nested in data
      if (data.success && data.user && data.token) {
        // ✅ Use token as accessToken
        const { user, token, refreshToken } = data
        storeLogin(user, token, refreshToken)
        
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/tenant/dashboard')
        }
        
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.message || 'Login failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const response = await api.post<any>('/auth/register', data)
      
      const result = response as any
      
      if (result.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.message || 'Registration failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      storeLogout()
      router.push('/')
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    try {
      setLoading(true)
      const response = await api.put<any>('/auth/change-password', data)
      
      const result = response as any
      
      if (result.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.message || 'Password change failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Password change failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      setLoading(true)
      const response = await api.put<any>('/auth/profile', data)
      
      const result = response as any
      
      if (result.success && result.data) {
        storeUpdateProfile(result.data)
        return { success: true, data: result.data }
      } else {
        return { 
          success: false, 
          error: result.message || 'Profile update failed' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Profile update failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await api.post<any>('/auth/refresh-token')
      
      const data = response as any
      
      if (data.success && data.data) {
        const { token, refreshToken } = data.data
        setTokens(token, refreshToken)
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    refreshToken,
  }
}