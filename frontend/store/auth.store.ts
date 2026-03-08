import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (loading: boolean) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        console.log('📝 AuthStore - setUser:', { 
          email: user?.email, 
          role: user?.role,
          isAuthenticated: !!user 
        })
        set({ 
          user, 
          isAuthenticated: !!user 
        })
      },

      setTokens: (accessToken, refreshToken) => {
        console.log('🔑 AuthStore - setTokens:', { 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken 
        })
        set({ 
          accessToken, 
          refreshToken 
        })
      },

      setLoading: (isLoading) => {
        console.log('⏳ AuthStore - setLoading:', isLoading)
        set({ isLoading })
      },

      login: (user, accessToken, refreshToken) => {
        // ✅ Explicitly cast role to the correct type
        const role = user.role?.toLowerCase?.() as 'admin' | 'tenant'
        
        const normalizedUser: User = {
          ...user,
          role: role
        }
        
        console.log('📦 AuthStore - login:', {
          user: { 
            email: normalizedUser.email, 
            role: normalizedUser.role 
          },
          hasToken: !!accessToken,
          isAuthenticated: true
        })
        
        set({
          user: normalizedUser,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        console.log('🚪 AuthStore - logout')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateProfile: (data) => {
        console.log('✏️ AuthStore - updateProfile:', data)
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)