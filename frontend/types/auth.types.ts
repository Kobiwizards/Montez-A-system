export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'tenant'
  apartment?: string
  phone?: string
  rentAmount?: number
  balance?: number
  status?: 'CURRENT' | 'OVERDUE' | 'DELINQUENT'
  moveInDate?: string
  emergencyContact?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  phone: string
  password: string
  name: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  moveInDate: string
  emergencyContact?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ProfileUpdateData {
  phone?: string
  emergencyContact?: string
  notes?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}