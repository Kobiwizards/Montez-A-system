import { api } from './client'

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      // Type the response as what we expect from the backend
      type BackendResponse = {
        success: boolean;
        message: string;
        data: {
          user: any;
          accessToken: string;
          refreshToken?: string;
        }
      }
      
      // api.post might extract data or might not - handle both cases
      const response: any = await api.post('/auth/login', credentials);
      
      console.log('Login response type check:', {
        hasUser: !!response.user,
        hasAccessToken: !!response.accessToken,
        hasData: !!response.data,
        hasSuccess: response.success !== undefined,
        keys: Object.keys(response)
      });
      
      // Handle both possible response formats
      let user, accessToken, refreshToken;
      
      // Format 1: Already extracted { user, accessToken, refreshToken }
      if (response.user && response.accessToken) {
        user = response.user;
        accessToken = response.accessToken;
        refreshToken = response.refreshToken;
      }
      // Format 2: Still wrapped { success, message, data: { user, accessToken, refreshToken } }
      else if (response.data && response.data.user && response.data.accessToken) {
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      }
      // Format 3: Something else went wrong
      else {
        console.error('Unexpected response format:', response);
        throw new Error('Unexpected response format from server');
      }
      
      if (!user || !accessToken) {
        throw new Error('Missing user or token in response');
      }
      
      return {
        user,
        token: accessToken,
        refreshToken
      };
    } catch (error: any) {
      console.error('Auth API login error:', error);
      throw error;
    }
  },

  logout: () => api.post('/auth/logout'),

  register: (userData: any) => api.post('/auth/register', userData),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),

  refreshToken: (refreshToken: string) =>
    api.post<{ token: string; refreshToken: string }>('/auth/refresh-token', { refreshToken }),
}