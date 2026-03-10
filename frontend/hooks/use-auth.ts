import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api/client'
import { LoginCredentials, RegisterData, ChangePasswordData, User } from '@/types/auth.types'

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
      // ✅ RESTORE USER FROM LOCALSTORAGE
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        console.log('🔍 Auth Init - Storage check:', {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          storedUser: storedUser ? JSON.parse(storedUser) : null
        })

        // 🔥 CRITICAL FIX: If we have both token and user in localStorage but store is empty, restore them
        if (storedToken && storedUser && !user && !isAuthenticated) {
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log('🔄 Restoring user from localStorage:', parsedUser.email)
            
            // ✅ FIXED: Provide empty string if refreshToken doesn't exist
            const refreshToken = localStorage.getItem('refreshToken') || ''
            
            // Restore to store
            storeLogin(parsedUser, storedToken, refreshToken)
          } catch (error) {
            console.error('❌ Failed to restore user from localStorage:', error)
          }
        }
      }

      // Only fetch profile if we have token but no user in store
      if (accessToken && !user) {
        try {
          setLoading(true)
          console.log('🔄 Fetching user profile with token:', accessToken.substring(0, 20) + '...')

          const response = await api.get<any>('/auth/profile')
          const data = response as any

          if (data.success && data.data) {
            console.log('✅ Profile loaded:', data.data.email)
            setUser(data.data)
          } else {
            console.error('❌ Failed to load profile:', data.message)
          }
        } catch (error) {
          console.error('❌ Failed to load user profile:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [accessToken, user, setUser, setLoading, storeLogin, isAuthenticated])

  // Redirect if not authenticated for protected routes
  useEffect(() => {
    const protectedRoutes = ['/admin', '/tenant', '/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))

    console.log('🔐 Route protection check:', {
      pathname,
      isProtectedRoute,
      isAuthenticated,
      isLoading,
      userRole: user?.role
    })

    if (isProtectedRoute && !isAuthenticated && !isLoading) {
      console.log('🔄 Redirecting to login - not authenticated')
      router.push('/login')
    }
  }, [pathname, isAuthenticated, isLoading, router, user])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      console.log('🔑 Login attempt for:', credentials.email)

      const response = await api.post<any>('/auth/login', credentials)
      const data = response as any

      console.log('📦 Login response:', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        userRole: data.user?.role
      })

      if (data.success && data.user && data.token) {
        const { user, token, refreshToken } = data

        const role = user.role?.toLowerCase?.() as 'admin' | 'tenant'
        const normalizedUser: User = {
          ...user,
          role: role
        }

        console.log('✅ Login successful - user:', {
          email: normalizedUser.email,
          role: normalizedUser.role
        })

        storeLogin(normalizedUser, token, refreshToken)

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
          localStorage.setItem('accessToken', token)
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken)
          }
          localStorage.setItem('user', JSON.stringify(normalizedUser))
          console.log('💾 Data saved to localStorage')
        }

        const redirectPath = normalizedUser.role === 'admin' ? '/admin/dashboard' : '/tenant/dashboard'
        console.log('🔄 Redirecting to:', redirectPath)

        window.location.href = redirectPath

        return { success: true }
      } else {
        console.error('❌ Login failed:', data.message)
        return {
          success: false,
          error: data.message || 'Login failed'
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
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
      console.log('🚪 Logging out...')
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      storeLogout()
      console.log('✅ Logout complete, redirecting to home')
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
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
          localStorage.setItem('accessToken', token)
          localStorage.setItem('refreshToken', refreshToken)
        }
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  return {
    user,
    accessToken,
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