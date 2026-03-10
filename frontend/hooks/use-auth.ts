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
      // Always set loading true at start
      setLoading(true)
      
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token')
          const storedUser = localStorage.getItem('user')

          console.log('🔍 Auth Init - Storage check:', {
            hasToken: !!storedToken,
            hasUser: !!storedUser,
            storedUser: storedUser ? JSON.parse(storedUser) : null
          })

          if (storedToken && storedUser) {
            const parsedUser = JSON.parse(storedUser)
            console.log('✅ Restoring user from localStorage:', parsedUser.email)
            
            // Update both store and localStorage
            setUser(parsedUser)
            setTokens(storedToken, localStorage.getItem('refreshToken') || '')
            
            // Optionally verify token with backend
            try {
              const response = await api.get<any>('/auth/profile')
              const data = response as any
              if (data.success && data.data) {
                console.log('✅ Profile verified:', data.data.email)
                setUser(data.data)
              }
            } catch (error) {
              console.error('❌ Token verification failed, clearing storage')
              localStorage.removeItem('token')
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
              setUser(null)
              setTokens('', '')
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
      } finally {
        setLoading(false)
        console.log('🏁 Auth initialization complete')
      }
    }

    initAuth()
  }, [setUser, setTokens, setLoading])

  // Redirect if not authenticated for protected routes
  useEffect(() => {
    const protectedRoutes = ['/admin', '/tenant', '/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))

    console.log('🔐 Route protection check:', {
      pathname,
      isProtectedRoute,
      isAuthenticated,
      isLoading,
      userRole: user?.role,
      hasUser: !!user
    })

    // Wait for loading to complete before redirecting
    if (isLoading) {
      console.log('⏳ Still loading, skipping redirect check')
      return
    }

    if (isProtectedRoute && !isAuthenticated) {
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

        // Store in auth store FIRST
        storeLogin(normalizedUser, token, refreshToken)

        // Then store in localStorage
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

        // Small delay to ensure state updates
        setTimeout(() => {
          window.location.href = redirectPath
        }, 100)

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

  // ... rest of the methods remain the same

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