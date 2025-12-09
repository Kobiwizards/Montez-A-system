export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'TENANT'
    apartment?: string
  }
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  phone: string
  password: string
  name: string
  apartment: string
  unitType: 'ONE_BEDROOM' | 'TWO_BEDROOM'
  moveInDate: string
  emergencyContact?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'TENANT'
  apartment?: string
}

export interface JwtPayload {
  id: string
  email: string
  role: 'ADMIN' | 'TENANT'
  apartment?: string
  iat: number
  exp: number
}