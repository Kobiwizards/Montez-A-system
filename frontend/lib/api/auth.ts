import { api } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    refreshToken: string
    user: {
      id: string
      email: string
      name: string
      apartment: string
      role: 'ADMIN' | 'TENANT'
      rentAmount: number
      balance: number
    }
  }
}

export interface Profile {
  id: string
  email: string
  name: string
  phone: string
  apartment: string
  role: 'ADMIN' | 'TENANT'
  rentAmount: number
  waterRate: number
  balance: number
  status: string
  moveInDate: string
  leaseEndDate?: string
  emergencyContact?: string
  notes?: string
  idCopyUrl?: string
  contractUrl?: string
  createdAt: string
  updatedAt: string
}

class AuthAPI {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data)
      
      // Store tokens and user data
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response
    } catch (error: any) {
      console.error('Login API error:', error)
      throw error
    }
  }

  async getProfile(): Promise<{ success: boolean; data: Profile }> {
    return api.get('/auth/profile')
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/logout')
      return response
    } finally {
      // Always clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('token')
  }

  // Get current user from localStorage
  getCurrentUser(): Profile | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Get auth token
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }
}

export const authApi = new AuthAPI()
