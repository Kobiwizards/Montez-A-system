import { api } from './client'

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      // Backend returns: { success: true, token, refreshToken, user }
      const response = await api.post('/auth/login', credentials);
      
      console.log('Login API response:', response);
      
      // Validate response format
      if (!response.success || !response.token || !response.user) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response from server');
      }
      
      return {
        success: response.success,
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error: any) {
      console.error('Auth API login error:', error);
      throw error;
    }
  },

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) => 
    api.post<{ success: boolean; token: string; refreshToken: string }>('/auth/refresh-token', { refreshToken }),

  getProfile: () => api.get<{ success: boolean; data: any }>('/auth/profile'),

  updateProfile: (userData: any) => api.put('/auth/profile', userData),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
}