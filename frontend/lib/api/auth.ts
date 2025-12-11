import { api } from './index'

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ user: any; token: string; refreshToken?: string }>('/auth/login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  register: (userData: any) => api.post('/auth/register', userData),
  
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  
  refreshToken: (refreshToken: string) =>
    api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
}
