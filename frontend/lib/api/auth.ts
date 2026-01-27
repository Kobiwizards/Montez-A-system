import { api } from './client'

// Define response types
interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: any;
  message?: string;
}

interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  message?: string;
}

interface ProfileResponse {
  success: boolean;
  data: any;
  message?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('Attempting login for:', credentials.email);
      
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      console.log('Login API response:', response);
      
      const data = response as any;
      
      // ✅ FIXED: Check direct properties (backend returns token, refreshToken, user at root)
      if (!data.success || !data.token || !data.user) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      console.log('Login successful for user:', data.user.email);
      
      return {
        success: data.success,
        user: data.user,
        token: data.token,           // ✅ Backend returns "token" not "accessToken"
        refreshToken: data.refreshToken
      };
    } catch (error: any) {
      console.error('Auth API login error:', error);
      
      if (error.message.includes('Network')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      return await api.post<ApiResponse>('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  register: async (userData: any): Promise<ApiResponse> => {
    try {
      return await api.post<ApiResponse>('/auth/register', userData);
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      return await api.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  getProfile: async (): Promise<ProfileResponse> => {
    try {
      return await api.get<ProfileResponse>('/auth/profile');
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData: any): Promise<ApiResponse> => {
    try {
      return await api.put<ApiResponse>('/auth/profile', userData);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    try {
      return await api.post<ApiResponse>('/auth/change-password', data);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    try {
      return await api.post<ApiResponse>('/auth/verify-email', { token });
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      return await api.post<ApiResponse>('/auth/forgot-password', { email });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    try {
      return await api.post<ApiResponse>('/auth/reset-password', { token, password });
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  verifyToken: async (): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      return await api.get<{ success: boolean; user?: any; message?: string }>('/auth/verify-token');
    } catch (error: any) {
      console.error('Verify token error:', error);
      return { success: false, message: 'Token verification failed' };
    }
  }
};