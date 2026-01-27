import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api/client' // ✅ FIXED IMPORT
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
          const response = await api.get('/auth/profile')
          if (response.success && response.data) {
            setUser(response.data)
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
      const response = await api.post('/auth/login', credentials)
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data
        storeLogin(user, accessToken, refreshToken)
        
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
          error: response.message || 'Login failed' 
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
      const response = await api.post('/auth/register', data)
      
      if (response.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.message || 'Registration failed' 
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
      const response = await api.put('/auth/change-password', data)
      
      if (response.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.message || 'Password change failed' 
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
      const response = await api.put('/auth/profile', data)
      
      if (response.success && response.data) {
        storeUpdateProfile(response.data)
        return { success: true, data: response.data }
      } else {
        return { 
          success: false, 
          error: response.message || 'Profile update failed' 
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
      const response = await api.post('/auth/refresh-token')
      
      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data
        setTokens(accessToken, refreshToken)
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